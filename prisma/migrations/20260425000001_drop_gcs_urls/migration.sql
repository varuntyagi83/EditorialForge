/*
  Warnings:

  - You are about to drop the column `gcsUrl` on the `Composition` table.
  - You are about to drop the column `gcsUrl` on the `LogoAsset` table.
  - You are about to drop the column `gcsUrl` on the `ReferenceImage` table.
  - You are about to drop the column `gcsUrl` on the `Scene` table.

  All rows in these tables have a corresponding gcsPath value. The application
  now signs GCS URLs on-demand from gcsPath at API response time. Raw public
  URLs are no longer stored.
*/

-- AlterTable
ALTER TABLE "Composition" DROP COLUMN "gcsUrl";

-- AlterTable
ALTER TABLE "LogoAsset" DROP COLUMN "gcsUrl";

-- AlterTable
ALTER TABLE "ReferenceImage" DROP COLUMN "gcsUrl";

-- AlterTable
ALTER TABLE "Scene" DROP COLUMN "gcsUrl";
