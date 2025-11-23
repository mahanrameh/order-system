/*
  Warnings:

  - You are about to drop the `_BasketToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_BasketToProduct" DROP CONSTRAINT "_BasketToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BasketToProduct" DROP CONSTRAINT "_BasketToProduct_B_fkey";

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "productId" INTEGER;

-- DropTable
DROP TABLE "public"."_BasketToProduct";

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
