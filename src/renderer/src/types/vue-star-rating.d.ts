declare module 'vue-star-rating' {
  import { DefineComponent } from 'vue'
  
  interface StarRatingProps {
    rating?: number
    roundStartRating?: boolean
    readOnly?: boolean
    showRating?: boolean
    increment?: number
    borderWidth?: number
    starSize?: number
    activeColor?: string
    inactiveColor?: string
  }

  const StarRating: DefineComponent<StarRatingProps>
  export default StarRating
}

declare module '@renderer/components/games/GameDetails.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}