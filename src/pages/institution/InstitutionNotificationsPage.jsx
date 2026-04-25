import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../../api/notificationsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ApiMessage from "../../components/common/ApiMessage";
import { getApiErrorMessage } from "../../utils/errorUtils";
import "./InstitutionNotificationsPage.css";

function getNotificationTypeLabel(type) {
  switch (Number(type)) {
    case 0:
      return "Violeta";
    case 1:
      return "Azul";
    case 2:
      return "Verde";
    case 3:
      return "Amarillo";
    case 4:
      return "Naranja";
    case 5:
      return "Rojo";
    default:
      return "General";
  }
}

function getNotificationTypeClass(type) {
  switch (Number(type)) {
    case 0:
      return "notification-chip notification-chip--purple";
    case 1:
      return "notification-chip notification-chip--blue";
    case 2:
      return "notification-chip notification-chip--green";
    case 3:
      return "notification-chip notification-chip--yellow";
    case 4:
      return "notification-chip notification-chip--orange";
    case 5:
      return "notification-chip notification-chip--red";
    default:
      return "notification-chip notification-chip--neutral";
  }
}

function InstitutionNotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = async (isReload = false) => {
    if (!user?.id) return;

    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getUserNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudieron cargar las notificaciones."),
      );
    } finally {
      if (isReload) {
        setReloading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (markingId) return;

    try {
      setMarkingId(notificationId);
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((item) =>
          Number(item.id) === Number(notificationId)
            ? { ...item, isRead: true }
            : item,
        ),
      );

      showToast("Notificación marcada como leída.", "success");
    } catch (err) {
      showToast(
        getApiErrorMessage(
          err,
          "No se pudo marcar la notificación como leída.",
        ),
        "error",
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((item) => !item.isRead);

    if (!unreadItems.length || markingId) return;

    try {
      for (const item of unreadItems) {
        setMarkingId(item.id);
        await markNotificationAsRead(item.id);
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true })),
      );
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "No se pudieron marcar todas como leídas."),
        "error",
      );
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-shell institution-notifications-page">
        <LoadingSpinner text="Cargando notificaciones..." />
      </div>
    );
  }

  return (
    <div className="page-shell institution-notifications-page">
      <header className="institution-notifications-page__header">
        <div>
          <h1 className="section-title">Notificaciones</h1>
          <p className="section-subtitle">
            Acá vas a ver el historial de avisos importantes para tu
            institución.
          </p>
        </div>

        <div className="institution-notifications-page__actions">
          <Button
            type="button"
            variant="secondary"
            icon={<CheckCheck size={16} />}
            onClick={handleMarkAllAsRead}
            disabled={!unreadCount || !!markingId}
          >
            Marcar todas
          </Button>
        </div>
      </header>

      <ApiMessage type="error">{error}</ApiMessage>

      {notifications.length ? (
        <div className="institution-notifications-page__list">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`institution-notifications-page__card ${
                notification.isRead
                  ? "institution-notifications-page__card--read"
                  : "institution-notifications-page__card--unread"
              }`}
            >
              <div className="institution-notifications-page__card-top">
                <div className="institution-notifications-page__card-header">
                  <h3>{notification.title || "Notificación"}</h3>
                  <span className={getNotificationTypeClass(notification.type)}>
                    {getNotificationTypeLabel(notification.type)}
                  </span>
                </div>

                {!notification.isRead ? (
                  <span className="institution-notifications-page__unread-dot" />
                ) : null}
              </div>

              <p className="institution-notifications-page__message">
                {notification.message || "Sin detalle."}
              </p>

              <div className="institution-notifications-page__footer">
                <span className="institution-notifications-page__date">
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleString()
                    : "Fecha no informada"}
                </span>

                {!notification.isRead ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={markingId === notification.id}
                  >
                    {markingId === notification.id
                      ? "Marcando..."
                      : "Marcar como leída"}
                  </Button>
                ) : (
                  <span className="institution-notifications-page__read-label">
                    Leída
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tenés notificaciones"
          description="Cuando el sistema te envíe avisos, van a aparecer acá."
        />
      )}
    </div>
  );
}

export default InstitutionNotificationsPage;
