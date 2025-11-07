import type { Restaurant } from './RestaurantMap'

interface RestaurantDetailProps {
  restaurant: Restaurant | null
  onClose: () => void
}

export function RestaurantDetail({
  restaurant,
  onClose,
}: RestaurantDetailProps) {
  if (!restaurant) return null

  const mealTimes = []
  if (restaurant.hasBrunch) {
    mealTimes.push(
      `Brunch${restaurant.brunchPrice ? ` ($${restaurant.brunchPrice})` : ''}`,
    )
  }
  if (restaurant.hasLunch) {
    mealTimes.push(
      `Lunch${restaurant.lunchPrice ? ` ($${restaurant.lunchPrice})` : ''}`,
    )
  }
  if (restaurant.hasDinner) {
    mealTimes.push(
      `Dinner${restaurant.dinnerPrice ? ` ($${restaurant.dinnerPrice})` : ''}`,
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {restaurant.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-xl">⭐</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {restaurant.rating}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Address
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {restaurant.address}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Meal Times
              </h3>
              <div className="flex flex-wrap gap-2">
                {mealTimes.map((meal) => (
                  <span
                    key={meal}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm"
                  >
                    {meal}
                  </span>
                ))}
              </div>
            </div>

            {(restaurant.websiteUrl ||
              restaurant.yelpUrl ||
              restaurant.openTableUrl) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Links
                </h3>
                <div className="flex flex-col gap-2">
                  {restaurant.websiteUrl && (
                    <a
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      🌐 Website
                    </a>
                  )}
                  {restaurant.yelpUrl && (
                    <a
                      href={restaurant.yelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      🔍 Yelp
                    </a>
                  )}
                  {restaurant.openTableUrl && (
                    <a
                      href={restaurant.openTableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      🍽️ OpenTable
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
