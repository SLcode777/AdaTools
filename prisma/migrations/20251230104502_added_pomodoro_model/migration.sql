-- CreateTable
CREATE TABLE "pomodoro_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workDuration" INTEGER NOT NULL DEFAULT 50,
    "breakDuration" INTEGER NOT NULL DEFAULT 10,
    "longBreakDuration" INTEGER NOT NULL DEFAULT 15,
    "cycles" INTEGER NOT NULL DEFAULT 3,
    "sessionStartSound" TEXT NOT NULL DEFAULT 'bell',
    "breakStartSound" TEXT NOT NULL DEFAULT 'chime',
    "breakEndSound" TEXT NOT NULL DEFAULT 'gong',
    "sessionEndSound" TEXT NOT NULL DEFAULT 'ding',
    "backgroundImage" TEXT,
    "backgroundType" TEXT NOT NULL DEFAULT 'gallery',
    "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "autoStartBreaks" BOOLEAN NOT NULL DEFAULT false,
    "autoStartPomodoros" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pomodoro_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pomodoro_settings_userId_key" ON "pomodoro_settings"("userId");

-- CreateIndex
CREATE INDEX "pomodoro_settings_userId_idx" ON "pomodoro_settings"("userId");

-- AddForeignKey
ALTER TABLE "pomodoro_settings" ADD CONSTRAINT "pomodoro_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
