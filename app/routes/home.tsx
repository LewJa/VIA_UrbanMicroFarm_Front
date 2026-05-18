import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";
import GrowingSetupCard from "../components/growingSetup/GrowingSetupCard";
import {AddGrowingSetupModal} from "~/components/growingSetup/AddGrowingSetupPopUp";
import type {GrowingSetup, SetupReading} from "~/model/growingSetup/types";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(1);
  const [growingSetups, setGrowingSetups] = useState<GrowingSetup[]>([]);
  const [growingSetupError, setGrowingSetupError] = useState(null);

  const [userName, setUserName] = useState("Anya");
  const [welcomeText, setWelcomeText] = useState(`Good morning, `);


  // format date to display it in different format
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).replace(',', ' ·');

  const handleContinue = (data: {
    serialNumber: string;
    locationName: string;
  }) => {
    console.log(data);
    setIsModalOpen(false);
  };

    useEffect(() => {
    //     auth user
    //     setUserId
        if(userId == null) {
            // redirect to login page
            return;
        }

        const fetchGrowingSetups = async () => {
            const setups = await growingSetupsService.getSetupsByUserID(userId);
            // catch error if any
            setGrowingSetups(setups);
        };

        //TODO:
        //fetch user name
        //fetch  welcome text
        //fetch random subtext

        fetchGrowingSetups();
    }, [userId]);

  return (

    <div className="min-h-screen bg-mf-bg text-mf-ink">
        <div className="mx-6 mt-10 max-w-5xl">
            <p className="mf-small-text">{formattedDate}</p>
            <h1 className="mf-h1 mt-2 text-4xl sm:text-5xl text-mf-ink">
                {welcomeText}
                <span className="italic text-mf-forest">{userName}</span>
            </h1>
        </div>

        <div className="mx-6 mt-10 flex items-center justify-between">
            <p className="mf-small-text">Growing setups</p>

            <button
                className="mf-btn mf-btn-primary mf-btn-sm"
                onClick={() => setIsModalOpen(true)}
            >
                <span className="text-base leading-none">+</span>
                Add growing setup
            </button>
        </div>

        <section className="mx-6 mt-4 ">
            {growingSetups?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {growingSetups.map((setup) => (
                        <GrowingSetupCard
                            key={setup.id}
                            setupId={setup.id}
                            locationName={setup.location}
                            status={setup.status}
                        />
                    ))}
                </div>
            ) : growingSetupError ? (
                <div
                    className="mf-card flex flex-col items-center text-center
                       p-8 border-dashed border-[#E9C3B5] bg-[#F4DBD2]/40"
                >
                    <h2 className="mf-h2 text-xl text-[#7A2E1A]">Something went wrong</h2>
                    <p className="mt-1 text-sm text-mf-ink-2 max-w-sm">
                        Unable to load growing setups. Try refreshing the page.
                    </p>
                    <button
                        className="mf-btn mf-btn-secondary mt-5"
                        onClick={() => location.reload()}
                    >
                        Refresh page
                    </button>
                </div>
            ) : (
                <div
                    className="mf-card flex flex-col items-center text-center
                       p-10 border-dashed border-mf-line-2 bg-mf-cream/60"
                >
                    <div
                        className="mf-photo mf-photo-leaf rounded-mf-md mb-5
                         h-16 w-16 flex items-center justify-center"
                    >
                        <span className="font-mono text-[10px]">setup</span>
                    </div>
                    <h2 className="mf-h2 text-xl">No setups yet</h2>
                    <p className="mt-1 text-sm text-mf-ink-3 max-w-sm">
                        Connect your first growing setup using a serial number to begin.
                    </p>
                    <button
                        className="mf-btn mf-btn-primary mt-5"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add growing setup
                    </button>
                </div>
            )}
        </section>

      <AddGrowingSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={handleContinue}
      />
    </div>
  );
}
