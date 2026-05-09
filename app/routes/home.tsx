import GrowingSetupCard from "../features/plants/components/GrowingSetupCard";

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