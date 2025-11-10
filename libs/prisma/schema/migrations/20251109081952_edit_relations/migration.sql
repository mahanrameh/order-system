-- DropForeignKey
ALTER TABLE "public"."baskets" DROP CONSTRAINT "baskets_userId_fkey";

-- DropIndex
DROP INDEX "public"."orders_basketId_key";

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
