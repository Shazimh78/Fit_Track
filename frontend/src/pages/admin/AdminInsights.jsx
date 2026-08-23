import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import StatPlate from "../../components/StatPlate";

export default function AdminInsights() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .insights()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load insights."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-mute">Loading insights...</p>;
  if (error) {
    return (
      <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-1">Insights</h1>
      <p className="text-mute text-sm mb-6">{data.note}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatPlate value={data.total_users} label="Total users" accent="volt" />
        <StatPlate value={data.new_users_last_7_days} label="New (7 days)" accent="cobalt" />
        <StatPlate value={data.total_chat_messages} label="Chat messages" accent="ember" />
        <StatPlate value={data.total_exercises} label="Exercises" accent="volt" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-panel border border-line rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-mute mb-3">
            Most viewed exercises
          </h2>
          {data.most_viewed_exercises.length === 0 ? (
            <p className="text-mute text-sm">No views recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.most_viewed_exercises.map((ex) => (
                <li key={ex.name} className="flex justify-between text-sm">
                  <span className="text-bone">{ex.name}</span>
                  <span className="text-mute">{ex.view_count} views</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-panel border border-line rounded-lg p-5">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-mute mb-3">
            Most requested muscles
          </h2>
          {data.most_requested_muscles.length === 0 ? (
            <p className="text-mute text-sm">No recommender requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.most_requested_muscles.map((m) => (
                <li key={m.muscle} className="flex justify-between text-sm capitalize">
                  <span className="text-bone">{m.muscle.replace("_", " ")}</span>
                  <span className="text-mute">{m.request_count} requests</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
