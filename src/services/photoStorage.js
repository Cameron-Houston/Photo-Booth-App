// Initialize IndexedDB
const dbName = 'PhotoBoothDB';
const storeName = 'photos';
const version = 1;

export class PhotoStorage {
  static async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async savePhotos(photos) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const timestamp = new Date().toISOString();
      const photoStrip = {
        photos,
        timestamp,
        type: 'photoStrip'
      };

      return new Promise((resolve, reject) => {
        const request = store.add(photoStrip);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving photos:', error);
      throw error;
    }
  }

  static async getAllPhotoStrips() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  }

  static async deletePhotoStrip(id) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting photo strip:', error);
      throw error;
    }
  }
}
