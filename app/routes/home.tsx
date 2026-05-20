import { useEffect, useState } from "react";

import { growingSetupsService } from "~/services/growingSetupsService";

import GrowingSetupCard
  from "../components/growingSetup/growing-setup-card";

import { AddGrowingSetupModal }
  from "~/components/growingSetup/add-growingsetup";

import type {
  GrowingSetup,
} from "~/model/growingSetup/types";

export default function Home() {

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [userId, setUserId] =
    useState<number | null>(1);

  const [growingSetups, setGrowingSetups] =
    useState<GrowingSetup[]>([]);

const [growingSetupError, setGrowingSetupError] =
  useState<string | null>(null);
  const [userName, setUserName] =
    useState("Anya");

  const [welcomeText, setWelcomeText] =
    useState("Good morning, ");

  const date = new Date();

  const formattedDate =
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).replace(",", " ·");

  const handleContinue = (data: {
    serialNumber: string;
    locationName: string;
  }) => {

    const newSetup: GrowingSetup = {
      id: Date.now(),
      location: data.locationName,
      status: "healthy",
      createdAt: new Date().toISOString(),
    };

    setGrowingSetups((prev) => [
      ...prev,
      newSetup,
    ]);

    setIsModalOpen(false);
  };

  useEffect(() => {

    if (userId == null) {
      return;
    }

    const fetchGrowingSetups = async () => {

      try {

        const setups =
          await growingSetupsService
            .getSetupsByUserID(userId);

        setGrowingSetups(setups);

      } catch (error) {

        setGrowingSetupError("Failed to load growing setups");

      }
    };

    fetchGrowingSetups();

  }, [userId]);

  return (

    <>

      <div className="mx-6 mt-8">

        <p className="uppercase tracking-widest text-sm text-stone-400">
          {formattedDate}
        </p>

      </div>

      <div className="mx-6 mt-2">

        <h1
          className="
            text-5xl
            leading-tight
            font-serif
            text-stone-900
          "
        >
          {welcomeText}

          <span
            className="
              italic
              text-green-900
            "
          >
            {userName}
          </span>

        </h1>

        <p className="text-stone-400 mt-2">
          Let’s plant something.
        </p>

      </div>

      <div
        className="
          flex
          flex-row
          items-center
          justify-between
          m-6
        "
      >

        <p
          className="
            uppercase
            tracking-widest
            text-sm
            text-stone-400
          "
        >
          Growing setups
        </p>

        <button
          className="
            text-sm
            text-green-950
            flex
            items-center
            gap-2
          "
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-xl">+</span>

          New setup
        </button>

      </div>

      <div
        className="
          flex
          justify-center
          items-center
          px-4
        "
      >

        {growingSetups?.length > 0 ? (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-4
              w-full
            "
          >

            {growingSetups.map((setup) => (

              <GrowingSetupCard
                key={setup.id}
                setupId={setup.id}
                locationName={setup.location}
              />

            ))}

          </div>

        ) : growingSetupError ? (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center

              p-8
              m-6

              w-full
              max-w-md

              rounded-3xl

              border-2
              border-red-200

              bg-red-50
            "
          >

            <h2
              className="
                font-bold
                text-red-900
                text-xl
              "
            >
              Error
            </h2>

            <p
              className="
                text-sm
                text-red-700
                mt-2
                text-center
              "
            >
              Unable to load growing setups.
            </p>

            <button
              className="
                rounded-2xl

                py-3
                px-6
                mt-5

                bg-red-900
                text-white

                text-sm
              "
              onClick={() => location.reload()}
            >
              Refresh page
            </button>

          </div>

        ) : (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center

              p-8
              m-6

              w-full
              max-w-md

              rounded-3xl

              border-2
              border-dashed
              border-amber-200

              bg-[#f6f2e9]
            "
          >

            <img
              className="h-10 w-auto my-5"
              src={"public/LogoLight.svg"}
            />

            <h2
              className="
                font-serif
                text-3xl
                text-stone-900
              "
            >
              No setups yet
            </h2>

            <p
              className="
                text-stone-400
                text-center
                mt-3
                leading-relaxed
              "
            >
              Connect your first growing setup
              using a serial number to begin.
            </p>

            <button
              className="
                rounded-full

                px-6
                py-3

                mt-6

                bg-green-950
                text-white

                text-sm

                hover:bg-green-900
                transition
              "
              onClick={() => setIsModalOpen(true)}
            >
              + Add growing setup
            </button>

          </div>

        )}

      </div>

      <AddGrowingSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={handleContinue}
      />

    </>
  );
}