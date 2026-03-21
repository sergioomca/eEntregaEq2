package com.epu.prototipo.service;

import com.epu.prototipo.model.Equipo;
import com.epu.prototipo.model.EstadoDcs;
import com.epu.prototipo.model.CondicionEquipo;
import com.epu.prototipo.service.gateway.DcsGateway;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
@Profile("prod")
public class FirestoreEquipoService implements IEquipoService {

    private final Firestore firestore;
    private final DcsGateway dcsGateway;
    private static final String COLLECTION_NAME = "equipos";

    public FirestoreEquipoService(Firestore firestore, DcsGateway dcsGateway) {
        this.firestore = firestore;
        this.dcsGateway = dcsGateway;
    }

    @Override
    public Equipo getEquipoByTag(String tag) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION_NAME).document(tag).get().get();
            if (!doc.exists()) {
                throw new RuntimeException("Equipo no encontrado con tag: " + tag);
            }
            return doc.toObject(Equipo.class);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar equipo: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Equipo> getAllEquipos() {
        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION_NAME).get().get();
            List<Equipo> equipos = new ArrayList<>();
            snapshot.getDocuments().forEach(doc -> equipos.add(doc.toObject(Equipo.class)));
            return equipos;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al obtener equipos: " + e.getMessage(), e);
        }
    }

    @Override
    public Equipo actualizarEstadoEquipo(String tag, String nuevoEstadoDcs) {
        Equipo equipo = getEquipoByTag(tag);
        switch (nuevoEstadoDcs) {
            case EstadoDcs.HABILITADO:
                dcsGateway.habilitarEquipo(tag);
                equipo.setEstadoDcs(EstadoDcs.HABILITADO);
                break;
            case EstadoDcs.DESHABILITADO:
                dcsGateway.deshabilitarEquipo(tag);
                equipo.setEstadoDcs(EstadoDcs.DESHABILITADO);
                break;
            case EstadoDcs.PARADO:
            case EstadoDcs.EN_MARCHA:
                equipo.setEstadoDcs(nuevoEstadoDcs);
                break;
            default:
                throw new IllegalArgumentException("Estado DCS no válido: " + nuevoEstadoDcs);
        }
        saveEquipo(tag, equipo);
        return equipo;
    }

    @Override
    public Equipo actualizarCondicionEquipo(String tag, String nuevaCondicion) {
        Equipo equipo = getEquipoByTag(tag);
        if (CondicionEquipo.BLOQUEADO.equals(nuevaCondicion) || CondicionEquipo.DESBLOQUEADO.equals(nuevaCondicion)) {
            equipo.setCondicion(nuevaCondicion);
        } else {
            throw new IllegalArgumentException("Condición no válida: " + nuevaCondicion);
        }
        saveEquipo(tag, equipo);
        return equipo;
    }

    @Override
    public Equipo createEquipo(Equipo equipo) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME)
                    .document(equipo.getTag()).get().get();
            if (existing.exists()) {
                throw new RuntimeException("Ya existe un equipo con tag: " + equipo.getTag());
            }
            firestore.collection(COLLECTION_NAME).document(equipo.getTag()).set(equipo).get();
            return equipo;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al crear equipo: " + e.getMessage(), e);
        }
    }

    @Override
    public Equipo updateEquipo(String tag, Equipo equipo) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME).document(tag).get().get();
            if (!existing.exists()) {
                throw new RuntimeException("Equipo no encontrado con tag: " + tag);
            }
            equipo.setTag(tag);
            firestore.collection(COLLECTION_NAME).document(tag).set(equipo).get();
            return equipo;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al actualizar equipo: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteEquipo(String tag) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME).document(tag).get().get();
            if (!existing.exists()) {
                throw new RuntimeException("Equipo no encontrado con tag: " + tag);
            }
            firestore.collection(COLLECTION_NAME).document(tag).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al eliminar equipo: " + e.getMessage(), e);
        }
    }

    private void saveEquipo(String tag, Equipo equipo) {
        try {
            firestore.collection(COLLECTION_NAME).document(tag).set(equipo).get();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al guardar equipo: " + e.getMessage(), e);
        }
    }
}
