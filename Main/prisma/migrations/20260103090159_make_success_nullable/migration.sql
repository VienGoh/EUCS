-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "respondenId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "success" BOOLEAN,
    "timeOnTask" REAL NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskResult_respondenId_fkey" FOREIGN KEY ("respondenId") REFERENCES "Responden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskResult" ("createdAt", "errorCount", "id", "respondenId", "success", "taskId", "timeOnTask") SELECT "createdAt", "errorCount", "id", "respondenId", "success", "taskId", "timeOnTask" FROM "TaskResult";
DROP TABLE "TaskResult";
ALTER TABLE "new_TaskResult" RENAME TO "TaskResult";
CREATE UNIQUE INDEX "TaskResult_respondenId_taskId_key" ON "TaskResult"("respondenId", "taskId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
