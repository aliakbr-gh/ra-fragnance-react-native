import ReactNativeBlobUtil from 'react-native-blob-util';
import { errorCodes, isErrorWithCode, keepLocalCopy, pick, saveDocuments, types } from '@react-native-documents/picker';
import Share from 'react-native-share';
import { closeDb, getDb, getDbPath, run } from '../db';

const fs = ReactNativeBlobUtil.fs;
const REQUIRED_TABLES = ['items', 'vendors', 'purchases', 'orders', 'customers', 'settings'];

const isCancel = (e: unknown) => isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED;

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Writes a consistent, compacted copy of the live database into the cache folder. */
async function snapshot() {
  const fileName = `RAFragnance-backup-${stamp()}.sqlite`;
  const path = `${fs.dirs.CacheDir}/${fileName}`;
  if (await fs.exists(path)) {
    await fs.unlink(path);
  }
  await run(`VACUUM INTO '${path.replace(/'/g, "''")}'`);
  return { path, fileName };
}

/** Opens the system "Save as" dialog so the user can store the backup in Downloads, Drive, etc. */
export async function downloadBackup(): Promise<string | null> {
  const { path, fileName } = await snapshot();
  try {
    const [res] = await saveDocuments({
      sourceUris: [`file://${path}`],
      mimeType: 'application/x-sqlite3',
      fileName,
    });
    if (res.error) {
      throw new Error(res.error);
    }
    return res.name ?? fileName;
  } catch (e) {
    if (isCancel(e)) {
      return null;
    }
    throw e;
  }
}

export async function shareBackup() {
  const { path, fileName } = await snapshot();
  await Share.open({ url: `file://${path}`, type: 'application/octet-stream', filename: fileName, failOnCancel: false });
}

/** Lets the user pick a .sqlite backup, validates it, and replaces the live database. Returns false if cancelled. */
export async function importBackup(): Promise<boolean> {
  let picked;
  try {
    [picked] = await pick({ type: [types.allFiles] });
  } catch (e) {
    if (isCancel(e)) {
      return false;
    }
    throw e;
  }

  const [copy] = await keepLocalCopy({
    files: [{ uri: picked.uri, fileName: `import-${Date.now()}.sqlite` }],
    destination: 'cachesDirectory',
  });
  if (copy.status !== 'success') {
    throw new Error(copy.copyError);
  }
  const importPath = decodeURIComponent(copy.localUri.replace(/^file:\/\//, ''));

  try {
    await run(`ATTACH DATABASE '${importPath.replace(/'/g, "''")}' AS incoming`);
    try {
      const res = await run("SELECT name FROM incoming.sqlite_master WHERE type = 'table'");
      const tables = res.rows.map(r => String(r.name));
      const missing = REQUIRED_TABLES.filter(t => !tables.includes(t));
      if (missing.length) {
        throw new Error(`This is not a RAFragnance backup (missing: ${missing.join(', ')}).`);
      }
    } finally {
      await run('DETACH DATABASE incoming');
    }
  } catch (e: any) {
    await fs.unlink(importPath).catch(() => {});
    if (/not a database|file is encrypted/i.test(e?.message ?? '')) {
      throw new Error('Selected file is not a valid SQLite database.');
    }
    throw e;
  }

  const dbPath = getDbPath();
  const safety = `${fs.dirs.CacheDir}/pre-import-${stamp()}.sqlite`;
  await run(`VACUUM INTO '${safety.replace(/'/g, "''")}'`).catch(() => {});

  closeDb();
  try {
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      if (await fs.exists(dbPath + suffix)) {
        await fs.unlink(dbPath + suffix);
      }
    }
    await fs.cp(importPath, dbPath);
    getDb();
  } catch (e) {
    if (await fs.exists(safety)) {
      if (await fs.exists(dbPath)) {
        await fs.unlink(dbPath);
      }
      await fs.cp(safety, dbPath);
    }
    getDb();
    throw e;
  } finally {
    await fs.unlink(importPath).catch(() => {});
  }
  return true;
}
