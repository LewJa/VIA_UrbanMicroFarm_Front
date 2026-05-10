type GrowingSetupCardProps = {
  name: string;
  temperature: number;
  humidity: number;
  light: number;
};

export default function GrowingSetupCard({
  name,
  temperature,
  humidity,
  light,
}: GrowingSetupCardProps) {
  return (
    <div>
      <h1>{name}</h1>

      <div>Temperature: {temperature}°</div>
      <div>Humidity: {humidity}%</div>
      <div>Light: {light}%</div>
    </div>
  );
}