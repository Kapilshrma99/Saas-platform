import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://192.168.0.249:5000';
const TOKEN_KEY = 'ownerAuthToken';

const formatDate = value => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function App() {
  const socketRef = useRef(null);
  const [token, setToken] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [socketState, setSocketState] = useState('offline');

  const authFetch = async (path, options = {}, activeToken = token) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
        ...(options.headers || {})
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
  };

  const loadNotifications = async activeToken => {
    setSyncing(true);
    try {
      const data = await authFetch('/api/notifications', {}, activeToken);
      setNotifications(data.notifications || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setSyncing(false);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketState('offline');
  };

  const connectSocket = activeToken => {
    disconnectSocket();

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token: activeToken }
    });

    socket.on('connect', () => setSocketState('connected'));
    socket.on('disconnect', () => setSocketState('offline'));
    socket.on('connect_error', socketError => {
      setSocketState('error');
      setError(socketError.message || 'Realtime connection failed');
    });
    socket.on('notification:new', notification => {
      setNotifications(current => [notification, ...current]);
    });

    socketRef.current = socket;
  };

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const me = await authFetch('/api/auth/me', {}, storedToken);
      setToken(storedToken);
      setTenant(me.tenant);
      await loadNotifications(storedToken);
      connectSocket(storedToken);
    } catch (restoreError) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setError('Session expired. Please sign in again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
    return () => disconnectSocket();
  }, []);

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setTenant(data.tenant);
      setPassword('');
      await loadNotifications(data.token);
      connectSocket(data.token);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const markAsRead = async notificationId => {
    try {
      await authFetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(current =>
        current.map(item =>
          item._id === notificationId ? { ...item, readAt: new Date().toISOString() } : item
        )
      );
    } catch (readError) {
      setError(readError.message);
    }
  };

  const handleLogout = async () => {
    disconnectSocket();
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTenant(null);
    setNotifications([]);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.helperText}>Loading owner session...</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.authCard}>
          <Text style={styles.title}>Owner Notifications</Text>
          <Text style={styles.subtitle}>Sign in to receive live booking alerts from your website.</Text>

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Owner email"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
            <Text style={styles.primaryButtonText}>{submitting ? 'Signing in...' : 'Sign In'}</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hello{tenant?.name ? `, ${tenant.name}` : ''}</Text>
          <Text style={styles.subtitle}>Socket status: {socketState}</Text>
        </View>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Notifications</Text>
        <Text style={styles.summaryValue}>{notifications.length}</Text>
        <Text style={styles.helperText}>
          {syncing ? 'Refreshing notifications...' : 'Live booking requests will appear here instantly.'}
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={[styles.notificationCard, item.readAt ? styles.notificationRead : null]}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.metaText}>Customer: {item.payload?.name || 'Unknown'}</Text>
            <Text style={styles.metaText}>Phone: {item.payload?.phone || 'Not provided'}</Text>
            <Text style={styles.metaText}>Requested for: {formatDate(item.payload?.datetime)}</Text>
            <Text style={styles.metaText}>Received: {formatDate(item.createdAt)}</Text>
            <Text style={styles.messageBody}>
              {item.payload?.message ? item.payload.message : 'No extra message was provided.'}
            </Text>
            {!item.readAt ? (
              <Pressable style={styles.secondaryButton} onPress={() => markAsRead(item._id)}>
                <Text style={styles.secondaryButtonText}>Mark as read</Text>
              </Pressable>
            ) : (
              <Text style={styles.readText}>Read</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.helperText}>No notifications yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 20,
    paddingTop: 24
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    gap: 12
  },
  authCard: {
    marginTop: 48,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 24,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    marginTop: 6,
    color: '#475569',
    fontSize: 15
  },
  input: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0f172a'
  },
  primaryButton: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '700'
  },
  summaryCard: {
    borderRadius: 26,
    backgroundColor: '#1d4ed8',
    padding: 22,
    marginBottom: 16
  },
  summaryLabel: {
    color: '#bfdbfe',
    fontSize: 14
  },
  summaryValue: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800'
  },
  listContent: {
    paddingBottom: 32,
    gap: 14
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  notificationRead: {
    opacity: 0.7
  },
  notificationTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700'
  },
  notificationMessage: {
    marginTop: 8,
    color: '#334155',
    fontSize: 15
  },
  metaText: {
    marginTop: 8,
    color: '#475569',
    fontSize: 13
  },
  messageBody: {
    marginTop: 12,
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20
  },
  helperText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14
  },
  errorText: {
    marginTop: 12,
    color: '#b91c1c',
    fontSize: 14
  },
  logoutText: {
    color: '#1d4ed8',
    fontWeight: '700'
  },
  readText: {
    marginTop: 14,
    color: '#047857',
    fontWeight: '700'
  }
});
