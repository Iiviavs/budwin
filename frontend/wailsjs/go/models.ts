export namespace hardware {
	
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

