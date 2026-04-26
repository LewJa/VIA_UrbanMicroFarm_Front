import { Outlet, NavLink } from "react-router";
// Import the image directly so the bundler handles it
import plantImg from "../../../assets/plant.png";
import "./plant-layout.css";

interface PlantLayoutProps {
  plantId: string;
}

export function PlantLayout({ plantId }: PlantLayoutProps) {
  const tabs = [
    { name: 'Basic data', path: 'basic-data' },
    { name: 'Predictions', path: 'predictions' },
    { name: 'Historical data', path: 'historical-data' }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Plant {plantId}</h1>
        
        <div className="dashboard-content">
          <div className="plant-container">{/* Left Column */}
            <span className="placeholder-icon">
              <img src={plantImg} alt="Plant" width={300} height={200} />
            </span>
            <p id="plant-species">Plant species</p>
          </div>
          <div className="data-container">  {/* Right Column */}
            <div className="tabs-header">  {/* Tab Navigation */}
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  end={tab.path === '.' || tab.path === ''}
                  className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                  {tab.name}
                </NavLink>
              ))}
            </div>

            <div className="tab-content-area">
                <div className="outlet-container"><Outlet /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
