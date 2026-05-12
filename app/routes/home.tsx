import {useEffect, useState} from "react";
import {growingSetupsService} from "~/features/growingSetups/service/growingSetupsService";
import GrowingSetupCard from "../features/growingSetups/components/growing-setup-card";
import {AddGrowingSetupModal} from "~/features/growingSetups/components/add-growingsetup";
import type {GrowingSetup, SetupReading} from "~/features/growingSetups/types";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(1);
  const [growingSetups, setGrowingSetups] = useState<GrowingSetup[]>([]);
  const [growingSetupError, setGrowingSetupError] = useState(null);

  const [userName, setUserName] = useState("Anya");
  const [welcomeText, setWelcomeText] = useState(`Good morning, `);


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

        //fetch user name
        //fetch  welcome text
        //fetch random subtext

        fetchGrowingSetups();
    }, [userId]);

  return (
    <>
        <div className="mx-6 mt-8">
            <p className="uppercase text-gray-400">{formattedDate}</p>
        </div>
        <div className="mx-6 mt-1">
            <h1 className="text-4xl font-bold" >{welcomeText}<span className="italic text-green-900">{userName}</span></h1>
        </div>

        <div className="flex flex-row items-center justify-between m-6" >
            <p className="uppercase text-gray-400">growing setups</p>

            <button className="rounded-2xl  text-sm text-gray-400
            sm:py-1 sm:my-3 sm:w-52  sm:bg-green-950 sm:text-gray-100"
                    onClick={() => setIsModalOpen(true)}>
                Add growing setup</button>
        </div>

        <div className="flex flex-col sm:flex-row align-middle justify-center">
            {growingSetups?.length > 0 ? (
                    <div className="f flex flex-col sm:flex-row">
                    {

                        growingSetups.map((setup) => (
                            <GrowingSetupCard
                                key={setup.id}
                                setupId={setup.id}
                                locationName={setup.location}
                            />
                        ))
                    }
                    </div>
                ) : growingSetupError ?
                (
                    <div className="flex flex-col align-middle justify-center items-center
                    p-6 m-6 w-1/2 border-2 rounded-2xl border-dashed border-red-200 bg-red-50">
                        {/*<img className="h-10 w-auto my-3" src={"public/LogoLight.svg"}/>*/}
                        <h2 className="font-bold text-red-900">Error</h2>
                        <p className="text-sm" >Unable to load growing setups. Try again and reload page.</p>

                        <button className="rounded-2xl py-1 my-3 w-1/2 bg-red-900 text-gray-100 text-sm" onClick={() => location.reload() }>Refresh page</button>
                    </div>
                )
                :
                (
                    <div className="flex flex-col align-middle justify-center items-center
                    p-6 m-6 w-1/2 border-2 rounded-2xl border-dashed border-amber-200 bg-amber-50">
                        <img className="h-10 w-auto my-3" src={"public/LogoLight.svg"}/>
                        <h2 className="font-bold">No setups yet</h2>
                        <p className="text-gray-500 text-sm" >Connect your first growing setup using a serial number to begin</p>

                        <button className="rounded-2xl py-1 my-3 w-1/2 bg-green-950 text-gray-100 text-sm" onClick={() => setIsModalOpen(true)}>Add growing setup</button>
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
