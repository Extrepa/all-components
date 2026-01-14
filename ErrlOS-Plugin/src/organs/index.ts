import { ErrlKernel } from "../kernel/ErrlKernel";
import { Plugin } from "obsidian";
import { DashboardOrgan } from "./dashboard/DashboardOrgan";
import { CaptureOrgan } from "./capture/CaptureOrgan";
import { ProjectPulseOrgan } from "./projectPulse/ProjectPulseOrgan";
import { TimeMachineOrgan } from "./timeMachine/TimeMachineOrgan";
import { LoreEngineOrgan } from "./loreEngine/LoreEngineOrgan";
import { RealityMapOrgan } from "./realityMap/RealityMapOrgan";
import { PromotionOrgan } from "./promotion/PromotionOrgan";
import { EnergyOrgan } from "./energy/EnergyOrgan";
import { FrictionScannerOrgan } from "./friction/FrictionScannerOrgan";
import { RitualOrgan } from "./ritual/RitualOrgan";
import { EntropyDialOrgan } from "./entropy/EntropyDialOrgan";
import { DreamBufferOrgan } from "./dreamBuffer/DreamBufferOrgan";
import { ThoughtRecyclerOrgan } from "./thoughtRecycler/ThoughtRecyclerOrgan";
import { SessionGhostOrgan } from "./sessionGhost/SessionGhostOrgan";
import { AssetBrainOrgan } from "./assetBrain/AssetBrainOrgan";
import { PromptForgeOrgan } from "./promptForge/PromptForgeOrgan";
import { ORGAN_METADATA, OrganId, OrganMetadata as OrganMetadataBase } from "./metadata";

export type OrganMetadata = OrganMetadataBase & {
	create: (kernel: ErrlKernel, plugin: Plugin) => any;
};

export const ORGAN_CREATORS: Record<OrganId, (kernel: ErrlKernel, plugin: Plugin) => any> = {
	dashboard: (kernel, plugin) => new DashboardOrgan(kernel, plugin),
	capture: (kernel, plugin) => new CaptureOrgan(kernel, plugin),
	projectPulse: (kernel, plugin) => new ProjectPulseOrgan(kernel, plugin),
	timeMachine: (kernel, plugin) => new TimeMachineOrgan(kernel, plugin),
	loreEngine: (kernel, plugin) => new LoreEngineOrgan(kernel, plugin),
	realityMap: (kernel, plugin) => new RealityMapOrgan(kernel, plugin),
	promotion: (kernel, plugin) => new PromotionOrgan(kernel, plugin),
	energy: (kernel, plugin) => new EnergyOrgan(kernel, plugin),
	frictionScanner: (kernel, plugin) => new FrictionScannerOrgan(kernel, plugin),
	ritual: (kernel, plugin) => new RitualOrgan(kernel, plugin),
	entropyDial: (kernel, plugin) => new EntropyDialOrgan(kernel, plugin),
	dreamBuffer: (kernel, plugin) => new DreamBufferOrgan(kernel, plugin),
	thoughtRecycler: (kernel, plugin) => new ThoughtRecyclerOrgan(kernel, plugin),
	sessionGhost: (kernel, plugin) => new SessionGhostOrgan(kernel, plugin),
	assetBrain: (kernel, plugin) => new AssetBrainOrgan(kernel, plugin),
	promptForge: (kernel, plugin) => new PromptForgeOrgan(kernel, plugin),
};

export const ORGANS: OrganMetadata[] = ORGAN_METADATA.map((organ) => ({
	...organ,
	create: ORGAN_CREATORS[organ.id as OrganId],
}));

export const getOrganMetadata = (id: string) => ORGANS.find((organ) => organ.id === id);

export const getOrganIds = () => ORGANS.map((organ) => organ.id);
