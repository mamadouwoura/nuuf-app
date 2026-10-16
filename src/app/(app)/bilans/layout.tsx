import GardeModule from "@/components/GardeModule";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GardeModule module="GERANCE">{children}</GardeModule>;
}
