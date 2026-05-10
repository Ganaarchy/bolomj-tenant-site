import Link from "next/link";
import { UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100">
          <UserX className="h-5 w-5 text-slate-600" />
        </div>
        <CardTitle>Бүртгэл түр хаалттай</CardTitle>
        <CardDescription>
          Customer self-registration backend endpoint одоогоор байхгүй тул production дээр бүртгэл
          үүсгэх боломжгүй.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/">Нүүр рүү буцах</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
