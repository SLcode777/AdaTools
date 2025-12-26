-- CreateTable
CREATE TABLE "domain_name" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "registrar" TEXT NOT NULL,
    "registrarUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "reminderOneMonth" BOOLEAN NOT NULL DEFAULT true,
    "reminderOneWeek" BOOLEAN NOT NULL DEFAULT true,
    "lastReminderSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_name_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "domain_name_userId_idx" ON "domain_name"("userId");

-- CreateIndex
CREATE INDEX "domain_name_expiresAt_idx" ON "domain_name"("expiresAt");

-- AddForeignKey
ALTER TABLE "domain_name" ADD CONSTRAINT "domain_name_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
