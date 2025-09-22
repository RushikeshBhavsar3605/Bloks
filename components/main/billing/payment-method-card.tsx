import { customerPortalLink } from "@/data/pricing";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentMethodCard {
  cardNumber: number;
  expiry: string;
  cardType: string;
  userEmail: string;
}
export const PaymentMethodCard = ({
  cardNumber,
  expiry,
  cardType,
  userEmail,
}: PaymentMethodCard) => {
  const router = useRouter();

  return (
    <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <div className="text-gray-900 dark:text-white font-medium">
              •••• •••• •••• {cardNumber}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Expires {expiry}
            </div>
          </div>
          <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
            {cardType}
          </div>
        </div>
        <button
          onClick={() =>
            router.push(`${customerPortalLink}?prefilled_email=${userEmail}`)
          }
          className="px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
};

PaymentMethodCard.Skeleton = function PaymentMethodCardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-10 rounded" />
        </div>
        <Skeleton className="h-9 w-16 rounded-lg" />
      </div>
    </div>
  );
};
