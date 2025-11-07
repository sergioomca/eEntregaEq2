package com.epu.prototipo.service;

import com.google.cloud.firestore.Firestore;
import com.epu.prototipo.model.PermisoTrabajoSeguro;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.ArrayList;

@Service
@Profile("prod")
public class FirestorePtsService implements PtsService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "permisos-trabajo-seguro";

    public FirestorePtsService(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public List<PermisoTrabajoSeguro> getAllPts() {
        try {
            var future = firestore.collection(COLLECTION_NAME).get();
            var querySnapshot = future.get();
            List<PermisoTrabajoSeguro> result = new ArrayList<>();
            
            querySnapshot.forEach(document -> {
                var pts = document.toObject(PermisoTrabajoSeguro.class);
                pts.setId(document.getId());
                result.add(pts);
            });
            
            return result;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener los Permisos de Trabajo Seguro.", e);
        }
    }

    @Override
    public PermisoTrabajoSeguro createPts(PermisoTrabajoSeguro pts) {
        try {
            var future = firestore.collection(COLLECTION_NAME).add(pts);
            var writeResult = future.get();
            pts.setId(writeResult.getId());
            System.out.println("PTS creado con éxito. ID de Firestore: " + writeResult.getId());
            return pts;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al crear PTS en Firestore: " + e.getMessage());
            throw new RuntimeException("Error al guardar el Permiso de Trabajo Seguro.", e);
        }
    }

    @Override
    public PermisoTrabajoSeguro getPtsById(String id) {
        try {
            var future = firestore.collection(COLLECTION_NAME).document(id).get();
            var document = future.get();
            if (document.exists()) {
                var pts = document.toObject(PermisoTrabajoSeguro.class);
                pts.setId(document.getId());
                return pts;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al obtener PTS de Firestore: " + e.getMessage());
            throw new RuntimeException("Error al obtener el Permiso de Trabajo Seguro.", e);
        }
    }
}