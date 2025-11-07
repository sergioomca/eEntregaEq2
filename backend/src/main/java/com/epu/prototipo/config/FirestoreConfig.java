package com.epu.prototipo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Profile("prod")
public class FirestoreConfig {

    @Value("${firebase.credentials:serviceAccountKey.json}")
    private String credentialsPath;

    @Bean
    public Firestore firestore() throws IOException {
        Path path = Paths.get(credentialsPath);
        if (!Files.exists(path)) {
            throw new IllegalStateException("Firebase credentials file not found at '" + credentialsPath + "'.\n" +
                    "Provide the JSON service account file at that path, or start the app with the 'test' profile to use a mock Firestore:\n" +
                    "  java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=test\n" +
                    "Or set the property 'firebase.credentials' to the correct path in application.properties.");
        }

        try (FileInputStream serviceAccount = new FileInputStream(path.toFile())) {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
            }
            return FirestoreClient.getFirestore();
        }
    }
}