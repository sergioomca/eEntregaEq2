package com.epu.prototipo.service.gateway;

import org.springframework.stereotype.Service;

@Service
public class MockDcsGateway implements DcsGateway {
    @Override
    public void deshabilitarEquipo(String tagEquipo) {
        System.out.println(">>> [MOCK_DCS_GATEWAY] Enviando comando OPC/Modbus...");
        System.out.println("    -> TAG: " + tagEquipo + " | NUEVO ESTADO: 0 (DESHABILITADO)");
        System.out.println("<<< [MOCK_DCS_GATEWAY] Comando confirmado por el DCS.");
    }

    @Override
    public void habilitarEquipo(String tagEquipo) {
        System.out.println(">>> [MOCK_DCS_GATEWAY] Enviando comando OPC/Modbus...");
        System.out.println("    -> TAG: " + tagEquipo + " | NUEVO ESTADO: 1 (HABILITADO)");
        System.out.println("<<< [MOCK_DCS_GATEWAY] Comando confirmado por el DCS.");
    }
}
