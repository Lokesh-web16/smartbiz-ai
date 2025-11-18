const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();

class BusinessDatabase {
  async saveConversation(userId, message, response) {
    // Store in Firestore
  }

  async getBusinessIdeas(userId) {
    // Get from Firestore
  }
}

module.exports = BusinessDatabase;