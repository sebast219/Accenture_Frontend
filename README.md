# Ionic To-Do List App

Aplicación de lista de tareas desarrollada con Ionic Angular, implementando Clean Architecture, programación reactiva con RxJS, y optimización de rendimiento.

## Características Principales

- ✅ Gestión completa de tareas (CRUD)
- ✅ Sistema de categorías personalizables
- ✅ Filtros por categoría con chips horizontales
- ✅ Swipe para completar/eliminar tareas
- ✅ Estadísticas de tareas en tiempo real
- ✅ Almacenamiento local persistente
- ✅ Feature flags con Firebase Remote Config
- ✅ Soporte para Android e iOS via Cordova

## Arquitectura

### Clean Architecture (core/data/presentation)

```
src/app/
├── core/                    # Capa de dominio
│   ├── models/             # Entidades de negocio
│   ├── repositories/       # Interfaces abstractas
│   └── services/         # Lógica de negocio
├── data/                   # Capa de datos
│   └── repositories/     # Implementaciones concretas
└── presentation/           # Capa de presentación
    ├── components/        # Componentes UI
    ├── pages/            # Páginas de la app
    └── pipes/            # Pipes personalizados
```

### Programación Reactiva (RxJS)

- **BehaviorSubject**: Para estado reactivo en repositorios
- **Observables**: Flujo de datos asíncrono
- **shareReplay**: Cacheo de observables
- **takeUntil**: Manejo de suscripciones y prevención de memory leaks

## Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd todo-app

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve
# o
npm start
```

## Scripts Disponibles

```bash
# Desarrollo
npm start                 # Servidor de desarrollo
npm run build            # Compilación producción
npm run watch            # Compilación con watch
npm test                 # Ejecutar tests
npm run lint             # Linting

# Cordova - Android
npm run cordova:android:debug    # APK debug
npm run cordova:android        # APK release

# Cordova - iOS (requiere macOS)
npm run cordova:ios:debug      # IPA debug
npm run cordova:ios            # IPA release

# Verificar requerimientos
npm run cordova:requirements
```

## Docker

```bash
# Construir imagen
docker-compose build

# Ejecutar contenedor
docker-compose up -d

# Acceder a la aplicación
http://localhost:8100
```

## Comandos para Generar APK e IPA

### Android (APK)

```bash
# 1. Asegurar que tienes Android Studio instalado
# 2. Configurar ANDROID_HOME y PATH

# Compilar APK debug (para pruebas)
npm run build
npx cordova build android

# Compilar APK release (para producción)
npm run build
npx cordova build android --release

# El APK se genera en:
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
# platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk

# Firmar APK (requiere keystore)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  alias_name

# Optimizar APK
zipalign -v 4 app-release-unsigned.apk TodoApp.apk
```

### iOS (IPA)

```bash
# NOTA: Requiere macOS con Xcode instalado

# 1. Agregar plataforma iOS
npx cordova platform add ios

# 2. Abrir proyecto en Xcode
npx cordova build ios
open platforms/ios/TodoApp.xcworkspace

# 3. En Xcode:
#    - Seleccionar dispositivo/destino
#    - Product > Archive
#    - Window > Organizer > Distribute App

# O compilar desde línea de comandos:
npx cordova build ios --device --release

# El IPA se genera en:
# platforms/ios/build/device/TodoApp.ipa
```

## Estructura de Directorios

```
todo-app/
├── config.xml              # Configuración Cordova
├── Dockerfile              # Imagen Docker
├── docker-compose.yml      # Orquestación Docker
├── package.json            # Dependencias y scripts
├── tailwind.config.js      # Configuración Tailwind
├── src/
│   ├── app/
│   │   ├── core/          # Lógica de negocio
│   │   ├── data/          # Acceso a datos
│   │   ├── presentation/  # UI/UX
│   │   └── ...
│   ├── environments/      # Configuración por ambiente
│   └── global.scss        # Estilos globales
├── platforms/             # Plataformas Cordova
│   ├── android/          
│   └── ios/
└── www/                   # Build output
```

## Tecnologías Utilizadas

- **Framework**: Ionic 8 + Angular 20
- **UI**: Tailwind CSS + Ionic Components
- **Estado**: RxJS (Observables, BehaviorSubject)
- **Almacenamiento**: @ionic/storage-angular
- **Firebase**: Remote Config, Feature Flags
- **Mobile**: Cordova (Android 15, iOS 8)
- **Testing**: Karma + Jasmine
- **Container**: Docker + Docker Compose

## Preguntas 

### 1. ¿Por qué se usa ChangeDetectionStrategy.OnPush?

**Respuesta:** `OnPush` es una estrategia de detección de cambios en Angular que optimiza significativamente el rendimiento:

- **Reduce ciclos de detección**: Solo re-renderiza cuando cambian los `@Input()` referencias o se emiten eventos
- **Mejor rendimiento**: Especialmente en listas largas con `*ngFor` y muchos componentes
- **Inmutabilidad**: Fomenta el uso de patrones inmutables, facilitando el debugging
- **En esta app**: Se aplica en componentes como `TaskItemComponent`, `CategoryFilterComponent`, `TaskStatsComponent` que reciben datos via inputs

```typescript
@Component({
  selector: 'app-task-item',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 2. ¿Cuál es la ventaja de usar shareReplay en los observables?

**Respuesta:** `shareReplay` es un operador RxJS que proporciona múltiples beneficios:

- **Multicasting**: Evita múltiples suscripciones al mismo observable fuente
- **Cacheo**: Almacena el último valor emitido para nuevos suscriptores
- **Optimización de red/memoria**: Reduce llamadas redundantes a repositorios
- **En esta app**: Se usa en `TaskService` para cachear `tasks$` y `stats$`

```typescript
this.tasks$ = this.taskRepository.getAll().pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
```

El `bufferSize: 1` guarda solo el último valor, y `refCount: true` libera recursos cuando no hay suscriptores.

### 3. ¿Por qué usar interfaces abstractas para repositorios?

**Respuesta:** Las interfaces abstractas (clases abstractas en este caso) aplican el principio de inversión de dependencias (DIP):

- **Desacoplamiento**: La capa de dominio no depende de implementaciones concretas
- **Testabilidad**: Facilita mocks en tests unitarios
- **Flexibilidad**: Permite cambiar la implementación (local → Firebase) sin modificar la lógica de negocio
- **Clean Architecture**: Separa claramente las responsabilidades entre capas

```typescript
// Core - Interfaz abstracta
export abstract class TaskRepository {
  abstract getAll(): Observable<Task[]>;
  abstract create(task: Omit<Task, 'id'>): Observable<Task>;
}

// Data - Implementación
@Injectable()
export class TaskLocalRepository extends TaskRepository {
  // Implementación con Ionic Storage
}

// Inyección en el módulo
{ provide: TaskRepository, useClass: TaskLocalRepository }
```

## Optimizaciones de Rendimiento Implementadas

1. **shareReplay**: Cacheo de observables
2. **trackBy**: Optimización de listas `*ngFor`
3. **OnPush**: Estrategia de detección de cambios
4. **Lazy Loading**: Carga diferida de módulos
5. **Pure Pipes**: `pure: true` en `FilterTasksPipe`
6. **takeUntil**: Cancelación de suscripciones automática

## Licencia

MIT License - Accenture Technical Assessment
