/* eslint-disable @typescript-eslint/no-explicit-any */
import UserGameDetails from "@/components/UserGameDetails";
import { useUserStore } from "@/store/user-store";

export default function Soon() {
  const user = useUserStore();


  return (
    <div className="flex flex-col justify-end bg-[url('/images/bg.png')] bg-cover flex-1">
      <div className="flex flex-col flex-1 w-full h-full px-6 pb-24 mt-12 modal-body">
        <UserGameDetails className="mt-4" />
        <div className="flex items-center justify-center mt-10 space-x-1 text-gradient">
          <img
            src="/images/coins.png"
            alt="coins"
            className="object-contain w-14 h-14"
          />
          <span className="text-3xl font-bold">
            {Math.floor(user.balance)?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-center flex-com mt-10">
            <h2 className="text-3xl">Coming Soon!</h2>
        </div>
      </div>
    </div>
  );
}
