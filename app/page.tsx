import dynamic from "next/dynamic";

export default function Home() {
  const AppWrapper = dynamic(() => import("@/components/app-wrapper"), {
    ssr: false,
  });

  return <AppWrapper />;
}
