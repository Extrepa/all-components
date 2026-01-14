import React from "react";

export type ErrlSpriteId =
  | "errl_prop_table_01"
  | "errl_prop_platform_01"
  | "errl_env_rug_round_01"
  | "errl_prop_beanbag_01"
  | "errl_prop_crate_01"
  | "errl_prop_shelf_01"
  | "errl_prop_block_01"
  | "errl_prop_podium_01"
  | "errl_prop_couch_01"
  | "errl_prop_side_table_01"
  | "errl_screen_tv_01"
  | "errl_screen_tv_02"
  | "errl_prop_projector_01"
  | "errl_prop_projector_02"
  | "errl_screen_hanging_01"
  | "errl_screen_tablet_01"
  | "errl_screen_monitor_01"
  | "errl_prop_projector_ceiling_01"
  | "errl_prop_vhs_01"
  | "errl_frame_polaroid_01"
  | "errl_prop_mug_01"
  | "errl_prop_cup_01"
  | "errl_prop_plate_blob_01"
  | "errl_prop_pizza_01"
  | "errl_prop_cookie_01"
  | "errl_prop_candy_01"
  | "errl_prop_bottle_01"
  | "errl_prop_box_01"
  | "errl_prop_candle_01"
  | "errl_prop_bowl_01"
  | "errl_env_plant_01"
  | "errl_env_plant_02"
  | "errl_env_vine_01"
  | "errl_env_bush_01"
  | "errl_env_cloud_01"
  | "errl_fx_stars_01"
  | "errl_env_moon_01"
  | "errl_env_mountain_01"
  | "errl_fx_sparkle_01"
  | "errl_env_rock_01"
  | "errl_goo_drip_top_01"
  | "errl_goo_drip_side_01"
  | "errl_goo_puddle_01"
  | "errl_goo_splat_01"
  | "errl_goo_droplet_01"
  | "errl_goo_drip_double_01"
  | "errl_goo_ring_01"
  | "errl_goo_splash_01"
  | "errl_goo_blob_01"
  | "errl_goo_trail_01"
  | "errl_ui_bubble_01"
  | "errl_ui_bubble_02"
  | "errl_ui_thought_01"
  | "errl_ui_tag_01"
  | "errl_ui_button_01"
  | "errl_ui_heart_01"
  | "errl_ui_warning_01"
  | "errl_ui_badge_star_01"
  | "errl_ui_play_01"
  | "errl_ui_slider_01"
  | "errl_hat_party_01"
  | "errl_hat_headband_01"
  | "errl_hat_crown_01"
  | "errl_hat_wizard_01"
  | "errl_accessory_glasses_01"
  | "errl_accessory_glasses_02"
  | "errl_accessory_scarf_01"
  | "errl_accessory_bowtie_01"
  | "errl_accessory_halo_01"
  | "errl_accessory_backpack_01"
  | "errl_frame_stand_01"
  | "errl_env_arch_01"
  | "errl_env_door_01"
  | "errl_env_window_01"
  | "errl_env_shelf_wall_01"
  | "errl_env_shrine_base_01"
  | "errl_env_poster_01"
  | "errl_env_lamp_ceiling_01"
  | "errl_env_lamp_floor_01"
  | "errl_env_frame_small_01"
  | "errl_fx_orb_01"
  | "errl_fx_ring_01"
  | "errl_fx_orb_cluster_01"
  | "errl_fx_particles_01"
  | "errl_fx_vignette_01"
  | "errl_fx_soft_blob_01"
  | "errl_fx_burst_01"
  | "errl_fx_ripple_01"
  | "errl_fx_triangles_01"
  | "errl_fx_corner_drips_01"
  | "errl_mystery_portal_01"
  | "errl_mystery_glyph_01"
  | "errl_totem_base_01"
  | "errl_totem_shrine_01"
  | "errl_misc_cube_01"
  | "errl_misc_pyramid_01"
  | "errl_misc_sticker_star_01"
  | "errl_misc_tape_corner_01"
  | "errl_misc_shadow_01"
  | "errl_misc_blob_friend_01";

export interface ErrlSpriteProps extends React.SVGProps<SVGSVGElement> {
  id: ErrlSpriteId;
  /** pixel size for width/height, or any CSS size string. Defaults to 64. */
  size?: number | string;
  /**
   * If you mounted the sprite inline in the DOM, leave this undefined.
   * If the sprite is in an external file, pass something like
   *   spriteUrl="/svgs/neon_purple_base_d946ef.svg".
   */
  spriteUrl?: string;
}

/**
 * Thin wrapper around <svg><use/></svg> for Errl sprite symbols.
 */
export const ErrlSprite: React.FC<ErrlSpriteProps> = ({
  id,
  size = 64,
  spriteUrl,
  className,
  children,
  ...rest
}) => {
  const href = spriteUrl ? `${spriteUrl}#${id}` : `#${id}`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden={rest["aria-label"] ? undefined : true}
      {...rest}
    >
      <use href={href} xlinkHref={href} />
      {children}
    </svg>
  );
};
