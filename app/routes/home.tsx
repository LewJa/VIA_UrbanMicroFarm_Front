import GrowingSetupCard from "../features/growingSetups/components/growing-setup-card";

export default function Home() {
  return (
    <GrowingSetupCard
      name="Growing setup"
      temperature={22}
      humidity={64}
      light={68}
    />
  );
}