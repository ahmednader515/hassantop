import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminProgressPanel } from "../../admin-assistant/_components/admin-progress-panel";

export default async function StudentsProgressPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <AdminProgressPanel variant="admin" />;
}
