const db = require('../../plugins/mysql');

const dbSet = {
    async setAutoCommitNo() {
        const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
        if (data[0].rt == 1) {
            const rv = await db.execute('SET AUTOCOMMIT = TRUE');
            // const [rv] = await db.execute('SET AUTOCOMMIT = FALSE');
        }
    },
    async setAutoCommit() {
        const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
        if (data[0].rt == 0) {
            const rv = await db.execute('SET AUTOCOMMIT = TRUE');
        }
    },
}

module.exports = dbSet;