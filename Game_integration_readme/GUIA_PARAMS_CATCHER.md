# Guía de integración del ParamsCatcher (setup de escenas)

> Esta guía cubre **dónde** colocar el validador en cada motor. El **contrato**
> (endpoint, heartbeat cada ~60 s, sin `-token`, cerrar el juego ante `403`) y los
> pasos de migración están en [`README.md`](./README.md). Los scripts listos para
> usar son `ParamsCatcherUNITY.md`, `ParamsCatcherGODOT.md` y
> `ParamsCatcherUNREAL.cpp.md` / `.h.md` en esta carpeta.
>
> Importante: el validador debe **persistir entre escenas** para poder hacer
> heartbeat (Unity: `DontDestroyOnLoad`; Godot: autoload / nodo persistente;
> Unreal: un actor que no se destruya al cambiar de mapa).

# 🧩 Cómo integrarlo en Unity

**1. Preparar el proyecto Unity**

* Crear una escena inicial (ej: Bootstrap o AuthScene)
* Agregar un GameObject vacío
* Adjuntar este script (ParamsCatcher)
* Asegurarte que **esa escena sea la primera en Build Settings**

**2. Configurar escenas**

* Escena 0 → Validación (esta)
* Escena 1 → Juego principal

Build Index:
0 → AuthScene
1 → MainGame

**🚀 Cómo integrarlo en Godot**

**1. Crear escena de arranque**

* Crear una escena (ej: AuthScene.tscn)
* Nodo raíz tipo Node
* Adjuntar este script

**2. Configurar escena principal**

Cambia esta línea:

get\_tree().change\_scene\_to\_file("res://MainGame.tscn")

por la ruta real de tu juego.

**🧩 Cómo integrarlo en Unreal**

**1. Habilitar módulo HTTP**

En tu .Build.cs:

PublicDependencyModuleNames.AddRange(new string[] {
 "Core",
 "CoreUObject",
 "Engine",
 "InputCore",
 "HTTP",
 "Json",
 "JsonUtilities"
});

**2. Crear el actor en el proyecto**

* Compilar el proyecto
* En el editor de Unreal:
  + Crear un Blueprint basado en ValidationManager
  + Arrastrarlo a la escena inicial

**3. Configurar mapa de arranque**

* Edit → Project Settings → Maps & Modes
* Startup Map → AuthMap (tu escena de validación)

**4. Crear flujo de escenas**

AuthMap → (validación) → MainLevel
