class FirebaseService {
    // Markets
    static async getMarkets() {
        const snapshot = await db.collection('markets').get();
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }

    static async updateMarket(marketId, data) {
        await db.collection('markets').doc(marketId).update(data);
    }

    // Banners
    static async getBanners() {
        const snapshot = await db.collection('banners').get();
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }

    static async uploadBanner(file, position) {
        const storageRef = storage.ref(`banners/${position}_${Date.now()}`);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();
        
        await db.collection('banners').doc(`position_${position}`).set({
            image: url,
            position: position,
            addedOn: new Date().toISOString()
        });
    }

    // Users
    static async getUsers() {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }

    static async updateUser(userId, data) {
        await db.collection('users').doc(userId).update(data);
    }
} 