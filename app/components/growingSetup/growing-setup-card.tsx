import type { SetupReading } from "~/model/growingSetup/types";
import { useEffect, useState } from "react";
import { growingSetupsService } from "~/services/growingSetupsService";

type GrowingSetupCardProps = {
  setupId: number;
  locationName: string;
};

export default function GrowingSetupCard({
  setupId,
  locationName,
}: GrowingSetupCardProps) {

  const [setupReadings, setSetupReadings] =
    useState<SetupReading | undefined>(undefined);

  useEffect(() => {

    const fetchReadings = async () => {

      try {
        const readings =
          await growingSetupsService
            .getSetupSensorReadings(setupId);

        setSetupReadings(readings);

      } catch (error) {
        console.error(error);
      }
    };

    fetchReadings();

  }, [setupId]);

  return (

    <div
      className="
        bg-white
        rounded-3xl
        border
        border-stone-200
        p-4
        m-3
        w-[340px]
        shadow-sm
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-serif text-stone-900">
            {locationName}
          </h2>

          <p className="text-sm text-stone-400">
            1 plant · sensor #A4-21
          </p>

        </div>

        <div
          className="
            bg-lime-100
            text-lime-900
            text-sm
            px-3
            py-1
            rounded-full
          "
        >
          ● healthy
        </div>

      </div>

      <div className="flex gap-3 mt-4">

        <div
          className="
            flex-1
            h-32
            rounded-2xl
            bg-[#bcc8a5]
            flex
            items-center
            justify-center
            text-stone-500
            uppercase
            tracking-widest
            text-sm
          "
        >
          Basil
        </div>

        <button
  className="
    w-24
    h-32
    rounded-2xl
    border-2
    border-dashed
    border-stone-200
    bg-stone-50

    flex
    items-center
    justify-center

    text-3xl
    text-stone-400

    transition
    hover:bg-stone-100
    hover:border-stone-300
    hover:text-stone-600

    cursor-pointer
  "
>
  +
</button>

      </div>

      <div className="mt-5">

        <p className="uppercase text-xs text-stone-400 mb-2">
          Live readings
        </p>

        <div className="flex justify-between">

          <div>
            <p className="text-xs text-stone-400">
              Temp
            </p>

            <p className="font-semibold text-stone-800">
              {setupReadings?.temperature ?? "--"}°
            </p>
          </div>

          <div>
            <p className="text-xs text-stone-400">
              Humidity
            </p>

            <p className="font-semibold text-stone-800">
              {setupReadings?.humidity ?? "--"}%
            </p>
          </div>

          <div>
            <p className="text-xs text-stone-400">
              Light
            </p>

            <p className="font-semibold text-stone-800">
              {setupReadings?.light ?? "--"}%
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}