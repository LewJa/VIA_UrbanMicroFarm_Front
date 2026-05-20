import {useEffect, useState} from "react";
import {growingSetupsService} from "~/services/growingSetupsService";
import GrowingSetupCard from "../components/growingSetup/GrowingSetupCard";
import {AddGrowingSetupModal} from "~/components/growingSetup/AddGrowingSetupPopUp";
import type {GrowingSetup, SetupReading} from "~/model/growingSetup/types";
import {useAuth} from "~/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const userId = user?.id ?? null;
  const [growingSetups, setGrowingSetups] = useState<GrowingSetup[]>([]);
  const [growingSetupError, setGrowingSetupError] = useState(null);

  const userName = user?.name || user?.email?.split("@")[0] || "";
  const [welcomeText] = useState(`Good morning, `);


  // format date to display it in different format
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).replace(',', ' ·');

  const handleContinue = async (data: {
    serialNumber: string;
    locationName: string;
  }) => {
    if (!userId) return;

    try {
        console.log(data);
        setIsModalOpen(false);
        
        // Right now the serial number is the serial number with all non-numeric characters removed, acting as a setup ID.
        const numericPart = data.serialNumber.replace(/\D/g, '');
        const setupId = parseInt(numericPart, 10);
        
        if (isNaN(setupId)) {
            throw new Error("Serial number must contain numbers to act as a setup ID");
        }

        await growingSetupsService.assignSetupToUser(userId, setupId);
        
        if (data.locationName) {
            await growingSetupsService.updateSetupLocation(setupId, data.locationName);
        }

        const setups = await growingSetupsService.getSetupsByUserID(userId);
        setGrowingSetups(setups);

        setShowConfirmation(true);
    } catch (error) {
        console.error("Failed to add setup:", error);
        setShowErrorModal(true);
    }
  };

    useEffect(() => {
        if (userId == null) return;

        const fetchGrowingSetups = async () => {
            const setups = await growingSetupsService.getSetupsByUserID(userId);
            setGrowingSetups(setups);
        };

        fetchGrowingSetups();
    }, [userId]);

    return (
    <>
        {showConfirmation && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity">
                <div className="bg-[#FAF8F5] rounded-3xl p-8 w-[90%] max-w-sm shadow-xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">Success!</h2>
                    <p className="text-gray-600 mb-8 text-center text-sm">Your growing setup has been successfully added to your account.</p>
                    <button 
                        onClick={() => setShowConfirmation(false)}
                        className="w-full rounded-full py-2 px-6 bg-[#2B4522] text-white font-medium hover:bg-green-900 transition-colors"
                    >
                        Continue &rarr;
                    </button>
                </div>
            </div>
        )}
        {showErrorModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity">
                <div className="bg-[#FAF8F5] rounded-3xl p-8 w-[90%] max-w-sm shadow-xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-8 text-center text-sm">We couldn't add your growing setup. Please check the serial number and try again.</p>
                    <button 
                        onClick={() => setShowErrorModal(false)}
                        className="w-full rounded-full py-2 px-6 bg-[#2B4522] text-white font-medium hover:bg-green-900 transition-colors"
                    >
                        Try Again &rarr;
                    </button>
                </div>
            </div>
        )}
        <div className="mx-6 mt-8">
            <p className="uppercase text-gray-400">{formattedDate}</p>
        </div>
        <div className="mx-6 mt-1">
            <h1 className="text-4xl font-bold" >{welcomeText}<span className="italic text-green-900">{userName}</span></h1>
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
                    className="mf-card flex flex-col items-center text-center p-8 border-dashed border-mf-err/30 bg-mf-err/8"
                >
                    <h2 className="mf-h2 text-xl text-mf-err">Something went wrong</h2>
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
    </>
  );
}
