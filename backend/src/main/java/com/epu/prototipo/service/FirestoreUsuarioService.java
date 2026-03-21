package com.epu.prototipo.service;

import com.epu.prototipo.dto.UsuarioDTO;
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
public class FirestoreUsuarioService implements IUsuarioService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "usuarios";

    public FirestoreUsuarioService(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public UsuarioDTO getUsuarioByLegajo(String legajo) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION_NAME).document(legajo).get().get();
            if (!doc.exists()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            return doc.toObject(UsuarioDTO.class);
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public List<UsuarioDTO> getAllUsuarios() {
        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION_NAME).get().get();
            List<UsuarioDTO> usuarios = new ArrayList<>();
            snapshot.getDocuments().forEach(doc -> usuarios.add(doc.toObject(UsuarioDTO.class)));
            return usuarios;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al obtener usuarios: " + e.getMessage(), e);
        }
    }

    @Override
    public List<UsuarioDTO> getUsuariosByRol(String rol) {
        try {
            QuerySnapshot snapshot = firestore.collection(COLLECTION_NAME)
                    .whereArrayContains("roles", rol)
                    .get().get();
            List<UsuarioDTO> usuarios = new ArrayList<>();
            snapshot.getDocuments().forEach(doc -> usuarios.add(doc.toObject(UsuarioDTO.class)));
            return usuarios;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al buscar usuarios por rol: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean existeUsuario(String legajo) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION_NAME).document(legajo).get().get();
            return doc.exists();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al verificar usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public UsuarioDTO createUsuario(UsuarioDTO usuario) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME)
                    .document(usuario.getLegajo()).get().get();
            if (existing.exists()) {
                throw new RuntimeException("Ya existe un usuario con legajo: " + usuario.getLegajo());
            }
            firestore.collection(COLLECTION_NAME).document(usuario.getLegajo()).set(usuario).get();
            return usuario;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al crear usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public UsuarioDTO updateUsuario(String legajo, UsuarioDTO usuario) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME).document(legajo).get().get();
            if (!existing.exists()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            usuario.setLegajo(legajo);
            firestore.collection(COLLECTION_NAME).document(legajo).set(usuario).get();
            return usuario;
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al actualizar usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteUsuario(String legajo) {
        try {
            DocumentSnapshot existing = firestore.collection(COLLECTION_NAME).document(legajo).get().get();
            if (!existing.exists()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            firestore.collection(COLLECTION_NAME).document(legajo).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error al eliminar usuario: " + e.getMessage(), e);
        }
    }
}
