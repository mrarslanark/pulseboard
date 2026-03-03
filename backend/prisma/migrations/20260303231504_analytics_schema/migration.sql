-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('crash', 'session', 'screen_view', 'api_call', 'metric', 'custom');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('critical', 'warning', 'info');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('crash', 'performance', 'network', 'release', 'user_behaviour');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceModel" TEXT,
    "manufacturer" TEXT,
    "appVersion" TEXT,
    "buildNumber" TEXT,
    "isEmulator" BOOLEAN,
    "networkType" TEXT,
    "carrier" TEXT,
    "userId" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "screenName" TEXT,
    "loadTime" INTEGER,
    "timeSpent" INTEGER,
    "endpoint" TEXT,
    "httpMethod" TEXT,
    "statusCode" INTEGER,
    "duration" INTEGER,
    "payloadSize" INTEGER,
    "errorMessage" TEXT,
    "errorName" TEXT,
    "stackTrace" TEXT,
    "isFatal" BOOLEAN,
    "crashGroupId" TEXT,
    "metricName" TEXT,
    "metricValue" DOUBLE PRECISION,
    "metricUnit" TEXT,
    "eventName" TEXT,
    "eventPayload" JSONB,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "appVersion" TEXT,
    "platform" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceModel" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "crashed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrashGroup" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "errorName" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "affectedUsers" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrashGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "InsightSeverity" NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAggregate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "appVersion" TEXT,
    "platform" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceModel" TEXT,
    "networkType" TEXT,
    "totalCrashes" INTEGER NOT NULL DEFAULT 0,
    "uniqueCrashers" INTEGER NOT NULL DEFAULT 0,
    "fatalCrashes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "crashedSessions" INTEGER NOT NULL DEFAULT 0,
    "avgSessionLength" INTEGER NOT NULL DEFAULT 0,
    "avgLaunchTime" INTEGER,
    "avgScreenLoad" INTEGER,
    "avgApiDuration" INTEGER,
    "apiErrorRate" DOUBLE PRECISION,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_projectId_idx" ON "AnalyticsEvent"("projectId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_appVersion_idx" ON "AnalyticsEvent"("appVersion");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_deviceModel_idx" ON "AnalyticsEvent"("deviceModel");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_crashGroupId_idx" ON "AnalyticsEvent"("crashGroupId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "Session_projectId_idx" ON "Session"("projectId");

-- CreateIndex
CREATE INDEX "Session_appVersion_idx" ON "Session"("appVersion");

-- CreateIndex
CREATE INDEX "Session_crashed_idx" ON "Session"("crashed");

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "CrashGroup_projectId_idx" ON "CrashGroup"("projectId");

-- CreateIndex
CREATE INDEX "CrashGroup_lastSeenAt_idx" ON "CrashGroup"("lastSeenAt");

-- CreateIndex
CREATE INDEX "CrashGroup_occurrences_idx" ON "CrashGroup"("occurrences");

-- CreateIndex
CREATE UNIQUE INDEX "CrashGroup_projectId_fingerprint_key" ON "CrashGroup"("projectId", "fingerprint");

-- CreateIndex
CREATE INDEX "Insight_projectId_idx" ON "Insight"("projectId");

-- CreateIndex
CREATE INDEX "Insight_severity_idx" ON "Insight"("severity");

-- CreateIndex
CREATE INDEX "Insight_isRead_idx" ON "Insight"("isRead");

-- CreateIndex
CREATE INDEX "Insight_generatedAt_idx" ON "Insight"("generatedAt");

-- CreateIndex
CREATE INDEX "DailyAggregate_projectId_idx" ON "DailyAggregate"("projectId");

-- CreateIndex
CREATE INDEX "DailyAggregate_date_idx" ON "DailyAggregate"("date");

-- CreateIndex
CREATE INDEX "DailyAggregate_appVersion_idx" ON "DailyAggregate"("appVersion");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAggregate_projectId_date_appVersion_platform_os_osVers_key" ON "DailyAggregate"("projectId", "date", "appVersion", "platform", "os", "osVersion", "deviceModel", "networkType");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_crashGroupId_fkey" FOREIGN KEY ("crashGroupId") REFERENCES "CrashGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrashGroup" ADD CONSTRAINT "CrashGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
