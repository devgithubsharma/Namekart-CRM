const dbName = "CampaignsDB";
const storeName = "campaignStatus";

function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
  
      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };
  
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(storeName, { keyPath: "campId" });
      };
    });
  }


export function updateCampaignStatus(campId, status) {
    initDB().then((db) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put({ campId, status });
  
      request.onerror = (event) => {
        console.error("Error updating campaign status:", event.target.error);
      };
  
      request.onsuccess = () => {
        console.log("Campaign status updated successfully");
      };
    });
  }

  export function fetchCampaignStatus(campId) {
    return new Promise((resolve, reject) => {
      initDB().then((db) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(campId);
  
        request.onerror = (event) => {
          console.error("Error fetching campaign status:", event.target.error);
          reject(event.target.error);
        };
  
        request.onsuccess = (event) => {
          resolve(event.target.result ? event.target.result.status : null);
        };
      });
    });
  }