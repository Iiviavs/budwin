export namespace hardware {
	
	export class AlertItem {
	    id: string;
	    type: string;
	    severity: string;
	    title: string;
	    description: string;
	    actionLabel: string;
	    targetPid?: number;
	    // Go type: time
	    timestamp: any;
	
	    static createFrom(source: any = {}) {
	        return new AlertItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.severity = source["severity"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.actionLabel = source["actionLabel"];
	        this.targetPid = source["targetPid"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DriveItem {
	    letter: string;
	    name: string;
	    totalGb: number;
	    freeGb: number;
	    usedGb: number;
	    percentUsed: number;
	
	    static createFrom(source: any = {}) {
	        return new DriveItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.letter = source["letter"];
	        this.name = source["name"];
	        this.totalGb = source["totalGb"];
	        this.freeGb = source["freeGb"];
	        this.usedGb = source["usedGb"];
	        this.percentUsed = source["percentUsed"];
	    }
	}
	export class GpuTelemetry {
	    isAvailable: boolean;
	    name: string;
	    coreUtilization: number;
	    memoryUtilization: number;
	    vramTotalMb: number;
	    vramUsedMb: number;
	    temperatureC: number;
	    fanSpeedPercent: number;
	    powerWatts: number;
	
	    static createFrom(source: any = {}) {
	        return new GpuTelemetry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isAvailable = source["isAvailable"];
	        this.name = source["name"];
	        this.coreUtilization = source["coreUtilization"];
	        this.memoryUtilization = source["memoryUtilization"];
	        this.vramTotalMb = source["vramTotalMb"];
	        this.vramUsedMb = source["vramUsedMb"];
	        this.temperatureC = source["temperatureC"];
	        this.fanSpeedPercent = source["fanSpeedPercent"];
	        this.powerWatts = source["powerWatts"];
	    }
	}
	export class TelemetrySnapshot {
	    cpuPercent: number;
	    cpuCores: number;
	    cpuModel: string;
	    ramPercent: number;
	    ramUsedGb: number;
	    ramTotalGb: number;
	    netInKb: number;
	    netOutKb: number;
	    diskReadMb: number;
	    diskWriteMb: number;
	    gpu: GpuTelemetry;
	
	    static createFrom(source: any = {}) {
	        return new TelemetrySnapshot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuPercent = source["cpuPercent"];
	        this.cpuCores = source["cpuCores"];
	        this.cpuModel = source["cpuModel"];
	        this.ramPercent = source["ramPercent"];
	        this.ramUsedGb = source["ramUsedGb"];
	        this.ramTotalGb = source["ramTotalGb"];
	        this.netInKb = source["netInKb"];
	        this.netOutKb = source["netOutKb"];
	        this.diskReadMb = source["diskReadMb"];
	        this.diskWriteMb = source["diskWriteMb"];
	        this.gpu = this.convertValues(source["gpu"], GpuTelemetry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace optimizer {
	
	export class AudioLatencyStatus {
	    isOptimized: boolean;
	    bufferLatencyMs: number;
	    mmcssPriority: string;
	    exclusiveMode: boolean;
	    systemResponsive: number;
	
	    static createFrom(source: any = {}) {
	        return new AudioLatencyStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isOptimized = source["isOptimized"];
	        this.bufferLatencyMs = source["bufferLatencyMs"];
	        this.mmcssPriority = source["mmcssPriority"];
	        this.exclusiveMode = source["exclusiveMode"];
	        this.systemResponsive = source["systemResponsive"];
	    }
	}
	export class AutoBoostStatus {
	    autoBoostEnabled: boolean;
	    activeGameName: string;
	    activeGamePid: number;
	    isBoosting: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AutoBoostStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.autoBoostEnabled = source["autoBoostEnabled"];
	        this.activeGameName = source["activeGameName"];
	        this.activeGamePid = source["activeGamePid"];
	        this.isBoosting = source["isBoosting"];
	    }
	}
	export class BenchmarkSummary {
	    isRunning: boolean;
	    durationSeconds: number;
	    avgCpuPercent: number;
	    maxCpuPercent: number;
	    avgRamPercent: number;
	    maxRamPercent: number;
	    maxGpuTemp: number;
	    avgGpuLoad: number;
	    stabilityScore: number;
	    verdict: string;
	    // Go type: time
	    startTime: any;
	    samplesCount: number;
	
	    static createFrom(source: any = {}) {
	        return new BenchmarkSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isRunning = source["isRunning"];
	        this.durationSeconds = source["durationSeconds"];
	        this.avgCpuPercent = source["avgCpuPercent"];
	        this.maxCpuPercent = source["maxCpuPercent"];
	        this.avgRamPercent = source["avgRamPercent"];
	        this.maxRamPercent = source["maxRamPercent"];
	        this.maxGpuTemp = source["maxGpuTemp"];
	        this.avgGpuLoad = source["avgGpuLoad"];
	        this.stabilityScore = source["stabilityScore"];
	        this.verdict = source["verdict"];
	        this.startTime = this.convertValues(source["startTime"], null);
	        this.samplesCount = source["samplesCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FpsTweakStatus {
	    ultimatePowerPlanActive: boolean;
	    gameDvrDisabled: boolean;
	    cpuCoreParkingDisabled: boolean;
	    highPriorityQueueActive: boolean;
	    gpuSchedulingUnlocked: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FpsTweakStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ultimatePowerPlanActive = source["ultimatePowerPlanActive"];
	        this.gameDvrDisabled = source["gameDvrDisabled"];
	        this.cpuCoreParkingDisabled = source["cpuCoreParkingDisabled"];
	        this.highPriorityQueueActive = source["highPriorityQueueActive"];
	        this.gpuSchedulingUnlocked = source["gpuSchedulingUnlocked"];
	    }
	}
	export class GameBoostResult {
	    active: boolean;
	    freedRamMb: number;
	    timerActive: boolean;
	    powerPlan: string;
	
	    static createFrom(source: any = {}) {
	        return new GameBoostResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.active = source["active"];
	        this.freedRamMb = source["freedRamMb"];
	        this.timerActive = source["timerActive"];
	        this.powerPlan = source["powerPlan"];
	    }
	}
	export class MonitorInfo {
	    index: number;
	    name: string;
	    isPrimary: boolean;
	    width: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new MonitorInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.index = source["index"];
	        this.name = source["name"];
	        this.isPrimary = source["isPrimary"];
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	}
	export class MultiMonitorSettings {
	    dimSecondaryMonitors: boolean;
	    autoDimOnGameLaunch: boolean;
	
	    static createFrom(source: any = {}) {
	        return new MultiMonitorSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dimSecondaryMonitors = source["dimSecondaryMonitors"];
	        this.autoDimOnGameLaunch = source["autoDimOnGameLaunch"];
	    }
	}
	export class StartupItem {
	    name: string;
	    command: string;
	    location: string;
	    enabled: boolean;
	    impact: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new StartupItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.command = source["command"];
	        this.location = source["location"];
	        this.enabled = source["enabled"];
	        this.impact = source["impact"];
	        this.description = source["description"];
	    }
	}

}

export namespace process {
	
	export class ProcessItem {
	    pid: number;
	    name: string;
	    description: string;
	    memoryMb: number;
	    cpuPercent: number;
	    category: string;
	    categoryLabel: string;
	
	    static createFrom(source: any = {}) {
	        return new ProcessItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.memoryMb = source["memoryMb"];
	        this.cpuPercent = source["cpuPercent"];
	        this.category = source["category"];
	        this.categoryLabel = source["categoryLabel"];
	    }
	}

}

export namespace storage {
	
	export class GameDuplicateItem {
	    id: string;
	    gameName: string;
	    category: string;
	    path: string;
	    sizeMb: number;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new GameDuplicateItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameName = source["gameName"];
	        this.category = source["category"];
	        this.path = source["path"];
	        this.sizeMb = source["sizeMb"];
	        this.description = source["description"];
	    }
	}
	export class GameHunterScanResult {
	    totalDuplicateMb: number;
	    items: GameDuplicateItem[];
	
	    static createFrom(source: any = {}) {
	        return new GameHunterScanResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalDuplicateMb = source["totalDuplicateMb"];
	        this.items = this.convertValues(source["items"], GameDuplicateItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StorageCategoryItem {
	    id: string;
	    name: string;
	    description: string;
	    sizeMb: number;
	    cleanable: boolean;
	    iconType: string;
	
	    static createFrom(source: any = {}) {
	        return new StorageCategoryItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.sizeMb = source["sizeMb"];
	        this.cleanable = source["cleanable"];
	        this.iconType = source["iconType"];
	    }
	}
	export class StorageScanResult {
	    totalCleanableMb: number;
	    categories: StorageCategoryItem[];
	
	    static createFrom(source: any = {}) {
	        return new StorageScanResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalCleanableMb = source["totalCleanableMb"];
	        this.categories = this.convertValues(source["categories"], StorageCategoryItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

