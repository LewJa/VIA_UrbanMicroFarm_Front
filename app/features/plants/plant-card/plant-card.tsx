import { useState } from "react";

import "./plant-card.css";

interface PlantCardProps {
  name: string;
  type: string;
  lastWatered: string;
  sunlight: string;
  createdAt: string;
  moisture: number;
  temperature: number;
  humidity: number;
  light: number;
  image?: string;
}

export default function PlantCard({
  name,
  type,
  lastWatered,
  sunlight,
  createdAt,
  moisture,
  temperature,
  humidity,
  light,
  image,
}: PlantCardProps) {

  const [activeTab, setActiveTab] =
    useState("now");

  return (

    <div className="plant-card">

      <div className="plant-image-wrapper">

        {image ? (

          <img
            src={image}
            alt={name}
            className="plant-image"
          />

        ) : (

          <div className="plant-image-placeholder">
            PLANT PHOTO
          </div>

        )}

      </div>

      <p className="plant-subtitle">
        {type.toUpperCase()} · DAY 24
      </p>

      <h1 className="plant-title">
        {name}
      </h1>

      <div className="plant-tags">

        <div className="tag">
          watered {lastWatered} ago
        </div>

        <div className="tag">
          {sunlight} sun
        </div>

      </div>

      <div className="plant-tabs">

        <button
          className={
            activeTab === "now"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("now")}
        >
          Now
        </button>

        <button
          className={
            activeTab === "about"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("about")}
        >
          About
        </button>

        <button
          className={
            activeTab === "predictions"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("predictions")}
        >
          Predictions
        </button>

        <button
          className={
            activeTab === "history"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("history")}
        >
          History
        </button>

      </div>

      {activeTab === "now" && (

        <div className="stats-container">

          <div className="stat-card">

            <div>
              <p className="stat-title">
                Moisture
              </p>

              <p className="stat-subtitle">
                last watered 6h ago
              </p>
            </div>

            <p className="stat-value">
              {moisture}%
            </p>

          </div>

          <div className="stat-card">

            <div>
              <p className="stat-title">
                Temperature
              </p>

              <p className="stat-subtitle">
                range 18°–25°
              </p>
            </div>

            <p className="stat-value">
              {temperature}°C
            </p>

          </div>

          <div className="stat-card">

            <div>
              <p className="stat-title">
                Humidity
              </p>

              <p className="stat-subtitle">
                ambient air
              </p>
            </div>

            <p className="stat-value">
              {humidity}%
            </p>

          </div>

          <div className="stat-card">

            <div>
              <p className="stat-title">
                Light
              </p>

              <p className="stat-subtitle">
                6.4 hrs of sun
              </p>
            </div>

            <p className="stat-value">
              {light}%
            </p>

          </div>

        </div>

      )}

      {activeTab === "about" && (

        <div className="stats-container">

          <div className="about-card">

            <p className="about-label">
              DESCRIPTION
            </p>

            <p className="about-text">
              Genovese basil started from seed on April 12.
              Pinched twice — first set of leaves harvested
              for caprese. Likes the south-facing greenhouse
              spot and the morning fog from the humidifier.
            </p>

            <p className="edit-text">
              Edit description
            </p>

          </div>

          <div className="details-card">

            <div className="details-row">
              <span>Type</span>
              <span>Herb · Lamiaceae</span>
            </div>

            <div className="details-row">
              <span>Planted</span>

              <span>
                {new Date(createdAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>

          </div>

        </div>

      )}

      {activeTab === "predictions" && (

        <div className="stats-container">

          <div className="stat-card">

            <p className="stat-title">
              Plant health prediction: Healthy
            </p>

          </div>

        </div>

      )}

      {activeTab === "history" && (

        <div className="stats-container">

          {[1, 2, 3, 4].map((item) => (

            <div
              className="history-card"
              key={item}
            >

              <div>

                <p className="stat-title">
                  Auto watering · 120ml
                </p>

                <p className="stat-subtitle">
                  Today, 06:12
                </p>

              </div>

              <p className="history-value">
                 62%→71%
              </p>

            </div>

          ))}

        </div>

      )}

    </div>

  );
}