import { HomeScreen } from "@workspace/app"
import { buttonVariants } from "@workspace/ui"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <HomeScreen
        footer={
          <Link
            href="/forms"
            className={buttonVariants({ variant: "outline" })}
          >
            View form components
          </Link>
        }
      />
    </div>
  )
}
