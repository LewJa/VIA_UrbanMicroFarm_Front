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