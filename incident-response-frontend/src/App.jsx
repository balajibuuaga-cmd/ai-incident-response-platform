import { useEffect, useState } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];

function App() {
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [editIncident, setEditIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [notification, setNotification] = useState("");

  const [commentAuthor, setCommentAuthor] = useState("Balaji");
  const [commentText, setCommentText] = useState("");
  const [newTaskName, setNewTaskName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const [logLevelFilter, setLogLevelFilter] = useState("ALL");
  const [logSearchTerm, setLogSearchTerm] = useState("");

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "HIGH",
    source: "",
    serviceId: "",
  });

  const [newLog, setNewLog] = useState({
    source: "",
    level: "INFO",
    message: "",
  });

  const [newService, setNewService] = useState({
    serviceName: "",
    ownerTeam: "",
    environment: "Production",
    criticality: "HIGH",
    status: "ACTIVE",
    description: "",
  });

  const loadData = async () => {
    const incidentRes = await axios.get("http://localhost:8080/api/incidents");
    const statsRes = await axios.get("http://localhost:8080/api/incidents/stats");
    const logsRes = await axios.get("http://localhost:8080/api/logs");
    const servicesRes = await axios.get("http://localhost:8080/api/services");

    setIncidents(incidentRes.data);
    setStats(statsRes.data);
    setLogs(logsRes.data);
    setServices(servicesRes.data);
  };

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/incidents", (message) => {
          setNotification(message.body);
          loadData();
          setTimeout(() => setNotification(""), 5000);
        });
      },
    });

    client.activate();
  };

  useEffect(() => {
    loadData();
    connectWebSocket();
  }, []);

  const openIncidentDetails = async (incident) => {
    const incidentRes = await axios.get(`http://localhost:8080/api/incidents/${incident.id}`);
    const historyRes = await axios.get(`http://localhost:8080/api/incidents/${incident.id}/history`);
    const commentsRes = await axios.get(`http://localhost:8080/api/incidents/${incident.id}/comments`);
    const tasksRes = await axios.get(`http://localhost:8080/api/incidents/${incident.id}/tasks`);
    const aiRes = await axios.get(`http://localhost:8080/api/incidents/${incident.id}/ai-summary`);

    setSelectedIncident(incidentRes.data);
    setEditIncident(incidentRes.data);
    setHistory(historyRes.data);
    setComments(commentsRes.data);
    setTasks(tasksRes.data);
    setAiSummary(aiRes.data);
  };

  const saveIncidentChanges = async () => {
    if (!editIncident || !selectedIncident) return;

    await axios.put(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/priority`,
      null,
      { params: { priority: editIncident.priority || "" } }
    );

    await axios.put(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/status`,
      null,
      { params: { status: editIncident.status, changedBy: "Balaji" } }
    );

    await axios.put(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/assign`,
      null,
      { params: { assignedTo: editIncident.assignedTo || "", changedBy: "Balaji" } }
    );

    const updatedIncidentRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}`
    );

    const historyRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/history`
    );

    setSelectedIncident(updatedIncidentRes.data);
    setEditIncident(updatedIncidentRes.data);
    setHistory(historyRes.data);
    loadData();
  };

  const createServiceNowTicket = async () => {
    if (!selectedIncident) return;

    await axios.post(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/servicenow-ticket`
    );

    const updatedIncidentRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}`
    );

    setSelectedIncident(updatedIncidentRes.data);
    setEditIncident(updatedIncidentRes.data);
    loadData();
  };

  const createService = async () => {
    if (!newService.serviceName.trim()) return;

    await axios.post("http://localhost:8080/api/services", newService);

    setNewService({
      serviceName: "",
      ownerTeam: "",
      environment: "Production",
      criticality: "HIGH",
      status: "ACTIVE",
      description: "",
    });

    loadData();
  };

  const deleteService = async (serviceId) => {
    await axios.delete(`http://localhost:8080/api/services/${serviceId}`);
    loadData();
  };

  const addTask = async () => {
    if (!newTaskName.trim()) return;

    await axios.post(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks`,
      { taskName: newTaskName }
    );

    const tasksRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks`
    );

    setTasks(tasksRes.data);
    setNewTaskName("");
  };

  const completeTask = async (taskId) => {
    await axios.put(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks/${taskId}/complete`
    );

    const tasksRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks`
    );

    setTasks(tasksRes.data);
  };

  const deleteTask = async (taskId) => {
    await axios.delete(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks/${taskId}`
    );

    const tasksRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/tasks`
    );

    setTasks(tasksRes.data);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;

    await axios.post(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/comments`,
      {
        author: commentAuthor,
        comment: commentText,
      }
    );

    const commentsRes = await axios.get(
      `http://localhost:8080/api/incidents/${selectedIncident.id}/comments`
    );

    setComments(commentsRes.data);
    setCommentText("");
  };

  const createIncident = async () => {
    if (!newIncident.title.trim()) return;

    await axios.post("http://localhost:8080/api/incidents", newIncident);

    setNewIncident({
      title: "",
      description: "",
      severity: "HIGH",
      source: "",
      serviceId: "",
    });

    loadData();
  };

  const submitLog = async () => {
    if (!newLog.source.trim() || !newLog.message.trim()) return;

    await axios.post("http://localhost:8080/api/logs/ingest", newLog);

    setNewLog({
      source: "",
      level: "INFO",
      message: "",
    });

    loadData();
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.source?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || incident.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || incident.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logLevelFilter === "ALL" || log.level === logLevelFilter;

    const matchesSearch =
      log.source?.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.message?.toLowerCase().includes(logSearchTerm.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  const severityData = [
    { name: "HIGH", value: incidents.filter((i) => i.severity === "HIGH").length },
    { name: "MEDIUM", value: incidents.filter((i) => i.severity === "MEDIUM").length },
    { name: "LOW", value: incidents.filter((i) => i.severity === "LOW").length },
  ];

  const statusData = [
    { name: "OPEN", count: incidents.filter((i) => i.status === "OPEN").length },
    { name: "IN_PROGRESS", count: incidents.filter((i) => i.status === "IN_PROGRESS").length },
    { name: "RESOLVED", count: incidents.filter((i) => i.status === "RESOLVED").length },
    { name: "CLOSED", count: incidents.filter((i) => i.status === "CLOSED").length },
  ];

  return (
    <div className="app">
      {notification && <div className="notification">🔔 {notification}</div>}

      <div className="header">
        <div>
          <h1>AI Incident Response Dashboard</h1>
          <p>Monitor incidents, security logs, business services, and automated alerts</p>
        </div>
        <button onClick={loadData}>Refresh</button>
      </div>

      <div className="stats-grid">
        <div className="card"><h3>Total Incidents</h3><p>{stats.total || 0}</p></div>
        <div className="card"><h3>Open</h3><p>{stats.open || 0}</p></div>
        <div className="card"><h3>In Progress</h3><p>{stats.inProgress || 0}</p></div>
        <div className="card"><h3>Resolved</h3><p>{stats.resolved || 0}</p></div>
        <div className="card"><h3>High Severity</h3><p>{stats.highSeverity || 0}</p></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={90} label>
                {severityData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Status Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="form-card">
        <h2>Create Business Service</h2>

        <input
          placeholder="Service Name"
          value={newService.serviceName}
          onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
        />

        <input
          placeholder="Owner Team"
          value={newService.ownerTeam}
          onChange={(e) => setNewService({ ...newService, ownerTeam: e.target.value })}
        />

        <input
          placeholder="Environment"
          value={newService.environment}
          onChange={(e) => setNewService({ ...newService, environment: e.target.value })}
        />

        <select
          value={newService.criticality}
          onChange={(e) => setNewService({ ...newService, criticality: e.target.value })}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <select
          value={newService.status}
          onChange={(e) => setNewService({ ...newService, status: e.target.value })}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="DOWN">DOWN</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
        </select>

        <textarea
          placeholder="Description"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
        />

        <button onClick={createService}>Create Service</button>
      </div>

      <div className="table-card">
        <h2>Business Services</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Name</th>
              <th>Owner Team</th>
              <th>Environment</th>
              <th>Criticality</th>
              <th>Status</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.serviceName}</td>
                <td>{service.ownerTeam}</td>
                <td>{service.environment}</td>
                <td>
                  <span className={`badge criticality-${service.criticality?.toLowerCase()}`}>
                    {service.criticality}
                  </span>
                </td>
                <td>
                  <span className={`badge service-status-${service.status?.toLowerCase()}`}>
                    {service.status}
                  </span>
                </td>
                <td>{service.description}</td>
                <td>
                  <button onClick={() => deleteService(service.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-card">
        <h2>Create Incident</h2>

        <input
          placeholder="Title"
          value={newIncident.title}
          onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={newIncident.description}
          onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
        />

        <select
          value={newIncident.severity}
          onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
        >
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
  value={newIncident.serviceId}
  onChange={(e) =>
    setNewIncident({
      ...newIncident,
      serviceId: e.target.value,
    })
  }
>
  <option value="">Select Affected Service</option>

  {services.map((service) => (
    <option key={service.id} value={service.id}>
      {service.serviceName}
    </option>
  ))}
</select>

        <input
          placeholder="Source"
          value={newIncident.source}
          onChange={(e) => setNewIncident({ ...newIncident, source: e.target.value })}
        />

        <button onClick={createIncident}>Create Incident</button>
      </div>

      <div className="form-card">
        <h2>Security Log Ingestion</h2>

        <input
          placeholder="Source e.g. auth-service"
          value={newLog.source}
          onChange={(e) => setNewLog({ ...newLog, source: e.target.value })}
        />

        <select
          value={newLog.level}
          onChange={(e) => setNewLog({ ...newLog, level: e.target.value })}
        >
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <textarea
          placeholder="Log message"
          value={newLog.message}
          onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
        />

        <button onClick={submitLog}>Submit Log</button>
      </div>

      <div className="filters">
        <input
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="ALL">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <div className="table-card">
        <h2>Incidents</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Service</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Source</th>
              <th>Assigned To</th>
              <th>Ticket</th>
            </tr>
          </thead>

          <tbody>
            {filteredIncidents.map((incident) => (
              <tr
                key={incident.id}
                className="clickable-row"
                onClick={() => openIncidentDetails(incident)}
              >
                <td>{incident.id}</td>
                <td>{incident.title}</td>
                <td>{incident.serviceName || "-"}</td>
                <td>
                  <span className={`badge severity-${incident.severity?.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge priority-${incident.priority?.toLowerCase()}`}>
                    {incident.priority || "N/A"}
                  </span>
                </td>
                <td>
                  <span className={`badge status-${incident.status?.toLowerCase()}`}>
                    {incident.status}
                  </span>
                </td>
                <td>{incident.source}</td>
                <td>{incident.assignedTo || "Unassigned"}</td>
                <td>{incident.serviceNowTicketNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="filters">
        <input
          placeholder="Search logs..."
          value={logSearchTerm}
          onChange={(e) => setLogSearchTerm(e.target.value)}
        />

        <select value={logLevelFilter} onChange={(e) => setLogLevelFilter(e.target.value)}>
          <option value="ALL">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      <div className="table-card">
        <h2>Security Logs</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Source</th>
              <th>Level</th>
              <th>Message</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.source}</td>
                <td>
                  <span className={`badge log-${log.level?.toLowerCase()}`}>
                    {log.level}
                  </span>
                </td>
                <td>{log.message}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIncident && editIncident && (
        <div className="details-panel">
          <div className="details-header">
            <h2>Incident Details</h2>
            <button onClick={() => setSelectedIncident(null)}>Close</button>
          </div>

          <h3>{selectedIncident.title}</h3>
          <p>{selectedIncident.description}</p>

          <div className="details-grid">
            <div><strong>ID:</strong> {selectedIncident.id}</div>
            <div><strong>Severity:</strong> {selectedIncident.severity}</div>
            <div><strong>Affected Service:</strong> {selectedIncident.serviceName || "N/A"}</div>

            <div>
              <strong>Priority:</strong>
              <select
                value={editIncident.priority || ""}
                onChange={(e) =>
                  setEditIncident({ ...editIncident, priority: e.target.value })
                }
              >
                <option value="">N/A</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <strong>Status:</strong>
              <select
                value={editIncident.status}
                onChange={(e) =>
                  setEditIncident({ ...editIncident, status: e.target.value })
                }
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div><strong>Source:</strong> {selectedIncident.source}</div>

            <div>
              <strong>Assigned To:</strong>
              <select
                value={editIncident.assignedTo || ""}
                onChange={(e) =>
                  setEditIncident({ ...editIncident, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                <option value="Balaji">Balaji</option>
                <option value="SOC Analyst">SOC Analyst</option>
                <option value="Security Lead">Security Lead</option>
                <option value="Cloud Team">Cloud Team</option>
              </select>
            </div>

            <div>
              <strong>ServiceNow Ticket:</strong>
              {selectedIncident.serviceNowTicketNumber ? (
                <span style={{ marginLeft: "10px", color: "#22c55e", fontWeight: "bold" }}>
                  {selectedIncident.serviceNowTicketNumber}
                </span>
              ) : (
                <button onClick={createServiceNowTicket} style={{ marginLeft: "10px" }}>
                  Create Ticket
                </button>
              )}
            </div>

            <div>
              <button onClick={saveIncidentChanges}>Save Changes</button>
            </div>
          </div>

          <div className="section">
            <h3>AI Summary</h3>
            {aiSummary && (
              <>
                <p><strong>Summary:</strong> {aiSummary.summary}</p>
                <p><strong>Root Cause:</strong> {aiSummary.possibleRootCause}</p>
                <p><strong>Recommended Action:</strong> {aiSummary.recommendedAction}</p>
                <p><strong>Risk Level:</strong> {aiSummary.riskLevel}</p>
              </>
            )}
          </div>

          <div className="section">
            <h3>History Timeline</h3>
            {history.length === 0 ? (
              <p>No history available.</p>
            ) : (
              history.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <strong>{item.oldStatus}</strong> → <strong>{item.newStatus}</strong>
                  <p>Changed by {item.changedBy} at {item.changedAt}</p>
                </div>
              ))
            )}
          </div>

          <div className="section">
            <h3>Investigation Tasks</h3>

            <div className="task-form">
              <input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Add investigation task..."
              />
              <button onClick={addTask}>Add Task</button>
            </div>

            {tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              tasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <div>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => completeTask(task.id)}
                      disabled={task.completed}
                    />
                    <span className={task.completed ? "task-done" : ""}>
                      {task.taskName}
                    </span>
                  </div>

                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              ))
            )}
          </div>

          <div className="section">
            <h3>Comments</h3>

            <div className="comment-form">
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Author"
              />

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add investigation note..."
              />

              <button onClick={addComment}>Add Comment</button>
            </div>

            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div className="comment" key={comment.id}>
                  <strong>{comment.author}</strong>
                  <p>{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

