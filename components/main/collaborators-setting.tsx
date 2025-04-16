import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRef, useState } from "react";
import EmailSelector, {
  EmailOption,
  EmailSelectorRef,
} from "../ui/multi-selector";

export const CollaboratorsSetting = () => {
  const emailSelectorRef = useRef<EmailSelectorRef>(null);
  const [email, setEmail] = useState<string>();
  const user = useCurrentUser();

  const handleInvite = (emails: EmailOption[]) => {
    console.log(
      "Inviting emails:",
      emails.map((email) => email.value)
    );
    // Here you would typically call your API to send invitations
  };

  return (
    <div className="">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-full">
          <EmailSelector
            ref={emailSelectorRef}
            onInvite={handleInvite}
            placeholder="Enter email addresses..."
            className="mb-4"
          />

          <p className="text-sm text-muted-foreground mt-2">
            Type an email address and press Enter to add it to the list.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              {user?.image ? (
                <AvatarImage src={user?.image} />
              ) : (
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="dark:text-white text-sm">
                  Rushikesh Bhavsar
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  (You)
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                prokiller3605@gmail.com
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-400 mr-1 text-sm">
              Full access
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">R</span>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-gray-300">{user?.email}</span>
                <span className="ml-2 text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                  Invited
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">Can view</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
