import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    adminApi
      .listUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load users."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleRole(user) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    setBusyId(user.id);
    try {
      await adminApi.updateUserRole(user.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't update role.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user) {
    const nextActive = !user.is_active;
    setBusyId(user.id);
    try {
      await adminApi.updateUserStatus(user.id, nextActive);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: nextActive } : u)));
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't update status.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-mute">Loading users...</p>;

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-6">Users</h1>

      {error && (
        <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-panel border border-line rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-panel2 text-mute text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-bone">{u.name}</td>
                <td className="px-4 py-3 text-mute">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={u.role === "admin" ? "text-volt font-semibold" : "text-mute"}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={u.is_active ? "text-cobalt" : "text-ember"}>
                    {u.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={busyId === u.id}
                    className="btn-secondary py-1 px-2.5 text-xs"
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={busyId === u.id}
                    className="btn-danger py-1 px-2.5 text-xs"
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
