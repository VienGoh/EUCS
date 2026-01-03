/*
  Warnings:

  - A unique constraint covering the columns `[platformId,id]` on the table `Responden` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[respondenId,questionId]` on the table `SUSAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[respondenId,taskId]` on the table `TaskResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Responden_platformId_id_key" ON "Responden"("platformId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SUSAnswer_respondenId_questionId_key" ON "SUSAnswer"("respondenId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_respondenId_taskId_key" ON "TaskResult"("respondenId", "taskId");
