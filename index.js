const { execute } = require('@getvim/execute');
const path = require('path');
const credentials = require('./databases.json');
const cron = require('node-cron')

const fs = require('fs');

async function backupSql(name, host, port, username, password) {

    const date = new Date();
    const currentDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
    const backupFolder = path.join(__dirname, 'backup');

    if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder);
    }

    const dbBackupFolder = path.join(backupFolder, name);

    if (!fs.existsSync(dbBackupFolder)) {
        fs.mkdirSync(dbBackupFolder);
    }

    const fileName = path.join(dbBackupFolder, `backup-${name}-${currentDate}.sql`);

    try {

        console.log(`Starting backup for database ${name}`);

        await execute(`PGPASSWORD="${password}" pg_dump -U ${username} -h ${host} -p ${port} -f ${fileName} -F c -b -v -d ${name}`)

        console.log(`Backup complete for database ${name}`);
    }
    catch (e) {
        console.log(`Backup error for database ${name}`)
        console.log(e);
    }

}

async function backupAllDatabases() {
    for (const db of credentials.databases) {
        const dbName = db.name;
        const dbHost = db.host;
        const dbPort = db.port;
        const dbUser = db.username;
        const dbPassword = db.password;

        await backupSql(dbName, dbHost, dbPort, dbUser, dbPassword);
    }
}

///'Tarefa agendada executada às 03:00 da manha  e as 15:00 da tarde .'
cron.schedule('0 3,15 * * *', () => {
    backupAllDatabases();
})

