import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function AboutScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mahasiswa, setMahasiswa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cameraRef = useRef(null);

  const NIM_USER = "0325260031";
  const BASE_URL = "http://192.168.1.5:8080/api/mahasiswa";

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${NIM_USER}`);
      if (response.ok) {
        const data = await response.json();
        setMahasiswa(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 });
      uploadPhoto(photo.uri);
    }
  };

  const uploadPhoto = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('nim', NIM_USER);
    formData.append('foto', {
      uri: uri,
      name: 'selfie.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.ok) {
        Alert.alert("Sukses", "Foto profil tersinkronisasi ke Server!");
        fetchMahasiswa();
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mengunggah foto ke server.");
    } finally {
      setIsLoading(false);
      setIsCameraOpen(false);
    }
  };

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (isCameraOpen) {
    if (!permission) return <View style={styles.container}><Text>Memuat perizinan...</Text></View>;
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.infoText}>Kami butuh akses kamera untuk Selfie Profil.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Beri Izin Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonDanger} onPress={() => setIsCameraOpen(false)}>
            <Text style={styles.buttonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.captureButtonText}>Ambil & Kirim</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
              <Text style={{ color: 'white', marginBottom: 20 }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={
            mahasiswa?.foto
              ? { uri: `data:image/jpeg;base64,${mahasiswa.foto}` }
              : { uri: 'https://i.pravatar.cc/150?img=3' }
          }
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>{mahasiswa?.nama || "Mahasiswa"}</Text>
        <Text style={styles.nimText}>{NIM_USER}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setIsCameraOpen(true)}>
          <Text style={styles.buttonText}>Ganti Foto Selfie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', justifyContent: 'center', alignItems: 'center' },
  profileCard: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 5 },
  profileImage: { width: 150, height: 150, borderRadius: 75, marginBottom: 20, borderWidth: 2, borderColor: '#0056b3' },
  nameText: { fontSize: 20, fontWeight: 'bold' },
  nimText: { fontSize: 16, color: 'gray', marginBottom: 20 },
  button: { backgroundColor: '#0056b3', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonDanger: { backgroundColor: 'red', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  infoText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  captureButton: { backgroundColor: 'white', padding: 15, borderRadius: 30, marginBottom: 20 },
  captureButtonText: { fontWeight: 'bold' },
});